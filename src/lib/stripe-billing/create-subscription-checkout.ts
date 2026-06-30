import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { planTierToPriceId } from "@/lib/stripe-billing/map-price-to-tier";
import { requireAppUrl } from "@/lib/require-app-url";
import { stripe } from "@/lib/stripe";
import type { PlanTier } from "@/lib/user-plan/types";
import { eq } from "drizzle-orm";

type CreateSubscriptionCheckoutInput = {
  userId: string;
  email: string;
  planTier: PlanTier;
};

export async function createSubscriptionCheckout({
  userId,
  email,
  planTier,
}: CreateSubscriptionCheckoutInput): Promise<{ url: string }> {
  const baseUrl = requireAppUrl();
  const priceId = planTierToPriceId(planTier);

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: { stripeBillingCustomerId: true },
  });

  let customerId = user?.stripeBillingCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });
    customerId = customer.id;

    await db
      .update(usersTable)
      .set({
        stripeBillingCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    locale: "pt-BR",
    customer: customerId,
    client_reference_id: userId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { userId, planTier },
    },
    metadata: {
      userId,
      planTier,
      type: "platform_subscription",
    },
    success_url: `${baseUrl}/profile?tab=subscription&checkout=success`,
    cancel_url: `${baseUrl}/group/create?checkout=canceled`,
  });

  const url = checkoutSession.url;
  if (!url) {
    throw new Error("Não foi possível gerar o link de assinatura.");
  }

  return { url };
}
