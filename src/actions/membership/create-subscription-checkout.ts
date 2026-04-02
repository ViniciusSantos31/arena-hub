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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const createSubscriptionCheckout = actionClient
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
    if (!plan) throw new Error("Nenhum plano mensal configurado para este grupo");

    const recipient = await db.query.paymentRecipientsTable.findFirst({
      where: and(
        eq(paymentRecipientsTable.organizationId, org.id),
        eq(paymentRecipientsTable.status, "active"),
      ),
    });
    if (!recipient) throw new Error("Organizador não configurou o recebimento");

    // Bloqueia convidados
    const memberRecord = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, org.id),
      ),
    });
    if (!memberRecord || memberRecord.role === "guest") {
      throw new Error("Convidados não podem assinar o plano mensal.");
    }

    // Verifica assinatura existente não-cancelada
    const existingSub = await db.query.memberSubscriptionsTable.findFirst({
      where: and(
        eq(memberSubscriptionsTable.userId, session.user.id),
        eq(memberSubscriptionsTable.organizationId, org.id),
        inArray(memberSubscriptionsTable.status, ["active", "trialing", "past_due"]),
      ),
    });
    if (existingSub) throw new Error("Você já possui uma assinatura ativa neste grupo");

    // Garante Stripe Customer
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

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      subscription_data: {
        application_fee_percent: PAYMENT_CONFIG.PLATFORM_SUBSCRIPTION_FEE_PERCENT,
        transfer_data: { destination: recipient.stripeAccountId },
        metadata: {
          arenaHubUserId: session.user.id,
          arenaHubOrgId: org.id,
        },
      },
      success_url: `${APP_URL}/group/${parsedInput.organizationCode}/dashboard?subscription=success`,
      cancel_url: `${APP_URL}/group/${parsedInput.organizationCode}/dashboard`,
      locale: "pt-BR",
      metadata: {
        arenaHubUserId: session.user.id,
        arenaHubOrgId: org.id,
        organizationCode: parsedInput.organizationCode,
        type: "subscription",
      },
    });

    return { url: checkoutSession.url };
  });
