"use server";

import { db } from "@/db";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { syncSubscriptionFromStripe } from "@/lib/stripe-billing/sync-subscription";
import { eq } from "drizzle-orm";
import z from "zod";

export const syncAdminUserSubscription = actionClient
  .inputSchema(z.object({ userId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const record = await db.query.userBillingSubscription.findFirst({
      where: eq(userBillingSubscription.userId, parsedInput.userId),
      columns: { stripeSubscriptionId: true },
    });

    if (!record) {
      throw new Error("Usuário não possui assinatura registrada.");
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      record.stripeSubscriptionId,
    );

    await syncSubscriptionFromStripe(stripeSubscription, parsedInput.userId);

    return { success: true };
  });
