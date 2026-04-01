import { db } from "@/db";
import {
  memberSubscriptionsTable,
} from "@/db/schema/memberships";
import {
  paymentRecipientsTable,
  paymentsTable,
  savedPaymentMethodsTable,
} from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
import { usersTable } from "@/db/schema/user";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  switch (event.type) {
    // ── Conta Connect do organizador ─────────────────────────────────────────

    case "account.updated": {
      const account = event.data.object;

      if (account.charges_enabled && account.details_submitted) {
        await db
          .update(paymentRecipientsTable)
          .set({ status: "active", updatedAt: new Date() })
          .where(eq(paymentRecipientsTable.stripeAccountId, account.id));
      } else {
        await db
          .update(paymentRecipientsTable)
          .set({ status: "blocked", updatedAt: new Date() })
          .where(
            and(
              eq(paymentRecipientsTable.stripeAccountId, account.id),
              eq(paymentRecipientsTable.status, "active"),
            ),
          );
      }
      break;
    }

    case "account.application.deauthorized": {
      const account = event.data.object;
      await db
        .update(paymentRecipientsTable)
        .set({ status: "blocked", updatedAt: new Date() })
        .where(eq(paymentRecipientsTable.stripeAccountId, account.id));
      break;
    }

    // ── Pagamentos dos jogadores ──────────────────────────────────────────────

    case "payment_intent.amount_capturable_updated": {
      const pi = event.data.object;
      const payment = await db.query.paymentsTable.findFirst({
        where: (p, { eq }) => eq(p.stripePaymentIntentId, pi.id),
      });
      if (!payment) break;

      await db
        .update(paymentsTable)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      await db
        .update(playersTable)
        .set({ paymentStatus: "paid", confirmed: true })
        .where(
          and(
            eq(playersTable.userId, payment.userId),
            eq(playersTable.matchId, payment.matchId),
          ),
        );

      // Salva o método de pagamento se vinculado a um customer
      await savePiPaymentMethod(pi, payment.userId);

      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const payment = await db.query.paymentsTable.findFirst({
        where: (p, { eq }) => eq(p.stripePaymentIntentId, pi.id),
      });
      if (!payment) break;

      await db
        .update(paymentsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      await db
        .delete(playersTable)
        .where(
          and(
            eq(playersTable.userId, payment.userId),
            eq(playersTable.matchId, payment.matchId),
          ),
        );

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      await db
        .update(paymentsTable)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(
          eq(
            paymentsTable.stripePaymentIntentId,
            charge.payment_intent as string,
          ),
        );
      break;
    }

    // ── Assinaturas mensais ───────────────────────────────────────────────────

    case "customer.subscription.updated": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = event.data.object as any;
      const status = mapStripeSubStatus(sub.status as string);
      const cancelAtPeriodEnd = sub.cancel_at_period_end === true;

      await db
        .update(memberSubscriptionsTable)
        .set({
          status,
          cancelAtPeriodEnd,
          currentPeriodStart: sub.current_period_start
            ? new Date((sub.current_period_start as number) * 1000)
            : undefined,
          currentPeriodEnd: sub.current_period_end
            ? new Date((sub.current_period_end as number) * 1000)
            : undefined,
          updatedAt: new Date(),
        })
        .where(
          eq(memberSubscriptionsTable.stripeSubscriptionId, sub.id as string),
        );
      break;
    }

    case "customer.subscription.deleted": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sub = event.data.object as any;
      await db
        .update(memberSubscriptionsTable)
        .set({
          status: "cancelled",
          cancelAtPeriodEnd: false,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          eq(memberSubscriptionsTable.stripeSubscriptionId, sub.id as string),
        );
      break;
    }

    case "invoice.payment_succeeded": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      if (!invoice.subscription) break;

      const subId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as { id: string }).id;

      await db
        .update(memberSubscriptionsTable)
        .set({
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(memberSubscriptionsTable.stripeSubscriptionId, subId));
      break;
    }

    case "invoice.payment_failed": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      if (!invoice.subscription) break;

      const subId =
        typeof invoice.subscription === "string"
          ? invoice.subscription
          : (invoice.subscription as { id: string }).id;

      await db
        .update(memberSubscriptionsTable)
        .set({
          status: "past_due",
          updatedAt: new Date(),
        })
        .where(eq(memberSubscriptionsTable.stripeSubscriptionId, subId));
      break;
    }

    // ── Método de pagamento configurado (SetupIntent) ─────────────────────────

    case "setup_intent.succeeded": {
      const si = event.data.object;
      if (si.payment_method && si.customer) {
        const customerId =
          typeof si.customer === "string" ? si.customer : si.customer.id;
        await upsertPaymentMethod(
          si.payment_method as string,
          customerId,
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────

function mapStripeSubStatus(
  stripeStatus: string,
): "active" | "trialing" | "past_due" | "cancelled" {
  switch (stripeStatus) {
    case "active":
      return "active";
    case "trialing":
      return "trialing";
    case "past_due":
    case "unpaid":
      return "past_due";
    default:
      return "cancelled";
  }
}

async function savePiPaymentMethod(
  pi: { payment_method?: string | { id: string } | null; customer?: string | { id: string } | null },
  userId: string,
) {
  if (!pi.payment_method || !pi.customer) return;

  const pmId =
    typeof pi.payment_method === "string"
      ? pi.payment_method
      : pi.payment_method.id;

  const customerId =
    typeof pi.customer === "string" ? pi.customer : pi.customer.id;

  await upsertPaymentMethod(pmId, customerId, userId);
}

async function upsertPaymentMethod(
  pmId: string,
  customerId: string,
  userId?: string,
) {
  // Resolve userId via customer se não fornecido
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const userRecord = await db.query.usersTable.findFirst({
      where: eq(usersTable.stripeCustomerId, customerId),
    });
    resolvedUserId = userRecord?.id;
  }

  if (!resolvedUserId) return;

  // Busca detalhes do método no Stripe
  let pm: Awaited<ReturnType<typeof stripe.paymentMethods.retrieve>>;
  try {
    pm = await stripe.paymentMethods.retrieve(pmId);
  } catch {
    return;
  }

  if (pm.type !== "card" || !pm.card) return;

  const existingMethods = await db.query.savedPaymentMethodsTable.findMany({
    where: eq(savedPaymentMethodsTable.userId, resolvedUserId),
  });

  const alreadyExists = existingMethods.some(
    (m) => m.stripePaymentMethodId === pmId,
  );
  if (alreadyExists) return;

  const isFirstCard = existingMethods.length === 0;

  await db.insert(savedPaymentMethodsTable).values({
    userId: resolvedUserId,
    stripePaymentMethodId: pmId,
    brand: pm.card.brand,
    last4: pm.card.last4,
    expMonth: pm.card.exp_month,
    expYear: pm.card.exp_year,
    isDefault: isFirstCard,
  });
}
