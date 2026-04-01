"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { memberSubscriptionsTable } from "@/db/schema/memberships";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const cancelSubscription = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });
    if (!org) throw new Error("Grupo não encontrado");

    const sub = await db.query.memberSubscriptionsTable.findFirst({
      where: and(
        eq(memberSubscriptionsTable.userId, session.user.id),
        eq(memberSubscriptionsTable.organizationId, org.id),
        inArray(memberSubscriptionsTable.status, ["active", "trialing", "past_due"]),
      ),
    });

    if (!sub) throw new Error("Nenhuma assinatura ativa encontrada");

    // Cancela no Stripe ao final do período vigente (não cancela imediatamente)
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Mantém status ativo — apenas sinaliza que não vai renovar.
    // O webhook customer.subscription.deleted marcará como 'cancelled' quando expirar.
    await db
      .update(memberSubscriptionsTable)
      .set({
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(memberSubscriptionsTable.id, sub.id));

    return { cancelled: true, currentPeriodEnd: sub.currentPeriodEnd };
  });
