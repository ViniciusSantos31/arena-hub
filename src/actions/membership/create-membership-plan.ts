"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { membershipPlansTable } from "@/db/schema/memberships";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { PAYMENT_CONFIG } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const createMembershipPlan = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
      amountCents: z
        .number()
        .int()
        .min(PAYMENT_CONFIG.MIN_SUBSCRIPTION_CENTS)
        .max(PAYMENT_CONFIG.MAX_SUBSCRIPTION_CENTS),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });

    if (!org) throw new Error("Grupo não encontrado");

    // Desativa plano anterior, se existir
    await db
      .update(membershipPlansTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(
        and(
          eq(membershipPlansTable.organizationId, org.id),
          eq(membershipPlansTable.isActive, true),
        ),
      );

    // Cria Stripe Product + Price recorrente mensal
    const product = await stripe.products.create({
      name: `Mensalidade — ${org.name}`,
      metadata: { arenaHubOrgId: org.id, arenaHubOrgCode: org.code ?? "" },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: parsedInput.amountCents,
      currency: "brl",
      recurring: { interval: "month" },
      metadata: { arenaHubOrgId: org.id },
    });

    const [plan] = await db
      .insert(membershipPlansTable)
      .values({
        organizationId: org.id,
        amountCents: parsedInput.amountCents,
        stripeProductId: product.id,
        stripePriceId: price.id,
        isActive: true,
      })
      .returning();

    return { plan };
  });
