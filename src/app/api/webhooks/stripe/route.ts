import { db } from "@/db";
import { paymentRecipientsTable, paymentsTable } from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
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
      // Dispara quando o organizador conclui o onboarding ou altera dados.
      // `charges_enabled` fica true quando o KYC é aprovado e a conta pode aceitar cobranças.
      const account = event.data.object;

      if (account.charges_enabled && account.details_submitted) {
        await db
          .update(paymentRecipientsTable)
          .set({ status: "active", updatedAt: new Date() })
          .where(eq(paymentRecipientsTable.stripeAccountId, account.id));
      } else {
        // Conta suspensa/bloqueada após ter sido ativa
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
      // Organizador revogou o acesso da plataforma à conta dele
      const account = event.data.object;
      await db
        .update(paymentRecipientsTable)
        .set({ status: "blocked", updatedAt: new Date() })
        .where(eq(paymentRecipientsTable.stripeAccountId, account.id));
      break;
    }

    // ── Pagamentos dos jogadores ──────────────────────────────────────────────

    case "payment_intent.amount_capturable_updated": {
      // Cartão autorizado com `capture_method: "manual"` — valor está em escrow.
      // Confirma o jogador na partida.
      const pi = event.data.object;
      const payment = await db.query.paymentsTable.findFirst({
        where: (p, { eq }) => eq(p.stripePaymentIntentId, pi.id),
      });
      if (!payment) break;

      await db
        .update(paymentsTable)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      // Filtro por userId E matchId para não confirmar jogador em outras partidas
      await db
        .update(playersTable)
        .set({ paymentStatus: "paid", confirmed: true })
        .where(
          and(
            eq(playersTable.userId, payment.userId),
            eq(playersTable.matchId, payment.matchId),
          ),
        );

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

      // Remove apenas o registro desta partida específica
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
  }

  return NextResponse.json({ received: true });
}
