import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { requireAppUrl } from "@/lib/require-app-url";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export async function createBillingPortalSession(
  userId: string,
): Promise<{ url: string }> {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    columns: { stripeBillingCustomerId: true },
  });

  if (!user?.stripeBillingCustomerId) {
    throw new Error(
      "Nenhuma assinatura encontrada. Assine um plano antes de gerenciar a cobrança.",
    );
  }

  const returnUrl =
    process.env.STRIPE_BILLING_PORTAL_RETURN_URL ??
    `${requireAppUrl()}/profile?tab=subscription`;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeBillingCustomerId,
    return_url: returnUrl,
  });

  return { url: portalSession.url };
}
