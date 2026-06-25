"use server";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createSubscriptionCheckout } from "@/lib/stripe-billing/create-subscription-checkout";
import { headers } from "next/headers";
import z from "zod/v4";

const planTierSchema = z.enum(["basic", "intermediate", "premium"]);

export const createPlanCheckoutSession = actionClient
  .inputSchema(
    z.object({
      planTier: planTierSchema,
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (!session.user.email) {
      throw new Error("E-mail do usuário não encontrado.");
    }

    return createSubscriptionCheckout({
      userId: session.user.id,
      email: session.user.email,
      planTier: parsedInput.planTier,
    });
  });
