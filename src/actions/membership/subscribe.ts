"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import {
  memberSubscriptionsTable,
  membershipPlansTable,
} from "@/db/schema/memberships";
import { paymentRecipientsTable } from "@/db/schema/payment";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { PAYMENT_CONFIG } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const subscribeMembership = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });
    if (!org) throw new Error("Grupo não encontrado");

    const plan = await db.query.membershipPlansTable.findFirst({
      where: and(
        eq(membershipPlansTable.organizationId, org.id),
        eq(membershipPlansTable.isActive, true),
      ),
    });
    if (!plan)
      throw new Error("Nenhum plano mensal configurado para este grupo");

    // Bloqueia convidados: apenas membros, admins e owners podem assinar
    const memberRecord = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, org.id),
      ),
    });
    if (!memberRecord || memberRecord.role === "guest") {
      throw new Error(
        "Convidados não podem assinar o plano mensal. Apenas membros do grupo têm acesso.",
      );
    }

    const recipient = await db.query.paymentRecipientsTable.findFirst({
      where: and(
        eq(paymentRecipientsTable.organizationId, org.id),
        eq(paymentRecipientsTable.status, "active"),
      ),
    });
    if (!recipient) throw new Error("Organizador não configurou o recebimento");

    // Verifica se já tem assinatura em qualquer estado não-cancelado
    const existingSub = await db.query.memberSubscriptionsTable.findFirst({
      where: and(
        eq(memberSubscriptionsTable.userId, session.user.id),
        eq(memberSubscriptionsTable.organizationId, org.id),
        inArray(memberSubscriptionsTable.status, [
          "active",
          "trialing",
          "past_due",
        ]),
      ),
    });
    if (existingSub) {
      // Se a assinatura existe mas precisa de confirmação de pagamento,
      // retorna o clientSecret existente em vez de criar uma nova
      if (existingSub.status === "trialing") {
        const stripeSub = await stripe.subscriptions.retrieve(
          existingSub.stripeSubscriptionId,
          { expand: ["latest_invoice.payment_intent"] },
        );

        const latestInvoice = stripeSub.latest_invoice as {
          payment_intent?: {
            client_secret?: string | null;
            status?: string;
          } | null;
        } | null;

        const clientSecret =
          latestInvoice?.payment_intent?.client_secret ?? null;

        return {
          subscriptionId: existingSub.id,
          stripeSubscriptionId: existingSub.stripeSubscriptionId,
          clientSecret,
          amountCents: plan.amountCents,
          alreadyExists: true,
        };
      }
      throw new Error("Você já possui uma assinatura ativa neste grupo");
    }

    // ── Garante Stripe Customer ─────────────────────────────────────────────
    const userRecord = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    let stripeCustomerId = userRecord?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { arenaHubUserId: session.user.id },
      });
      stripeCustomerId = customer.id;
      await db
        .update(usersTable)
        .set({ stripeCustomerId })
        .where(eq(usersTable.id, session.user.id));
    }

    // ── Cria Stripe Subscription ─────────────────────────────────────────────
    // payment_behavior: 'default_incomplete' → aguarda confirmação do primeiro pagamento
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
      application_fee_percent: PAYMENT_CONFIG.PLATFORM_SUBSCRIPTION_FEE_PERCENT,
      transfer_data: { destination: recipient.stripeAccountId },
      metadata: {
        arenaHubUserId: session.user.id,
        arenaHubOrgId: org.id,
      },
    });

    // Salva registro no banco (status inicial: trialing, atualizado via webhook)
    const [memberSub] = await db
      .insert(memberSubscriptionsTable)
      .values({
        userId: session.user.id,
        organizationId: org.id,
        stripeSubscriptionId: subscription.id,
        status: "trialing",
      })
      .returning();

    // Extrai clientSecret da primeira fatura para confirmar no frontend
    const latestInvoice = subscription.latest_invoice as {
      payment_intent?: {
        client_secret?: string | null;
        status?: string;
      } | null;
    } | null;

    const clientSecret = latestInvoice?.payment_intent?.client_secret ?? null;

    return {
      subscriptionId: memberSub.id,
      stripeSubscriptionId: subscription.id,
      clientSecret,
      amountCents: plan.amountCents,
    };
  });
