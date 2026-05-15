"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const getPaidMatchEligibility = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
      columns: { id: true, stripeAccountId: true },
    });

    if (!org) {
      throw new Error("Grupo não encontrado");
    }

    const membership = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, org.id),
      ),
    });

    if (!membership) {
      throw new Error("Sem acesso ao grupo");
    }

    if (!org.stripeAccountId) {
      return {
        canCreatePaidMatch: false,
        reason: "no_account" as const,
      };
    }

    let chargesEnabled = false;
    try {
      const account = await stripe.accounts.retrieve(org.stripeAccountId);
      chargesEnabled = !!account.charges_enabled;
    } catch {
      return {
        canCreatePaidMatch: false,
        reason: "onboarding_incomplete" as const,
      };
    }

    if (!chargesEnabled) {
      return {
        canCreatePaidMatch: false,
        reason: "onboarding_incomplete" as const,
      };
    }

    return {
      canCreatePaidMatch: true,
      reason: null,
    };
  });
