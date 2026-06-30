import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

export type SubscriptionPaymentStatus =
  | "paid"
  | "open"
  | "void"
  | "uncollectible"
  | "draft";

export type SubscriptionPayment = {
  id: string;
  date: string;
  amountCents: number;
  currency: string;
  status: SubscriptionPaymentStatus;
  invoiceUrl: string | null;
};

const PAYMENT_HISTORY_LIMIT = 10;

function mapInvoiceStatus(
  status: string | null,
): SubscriptionPaymentStatus | null {
  switch (status) {
    case "paid":
    case "open":
    case "void":
    case "uncollectible":
    case "draft":
      return status;
    default:
      return null;
  }
}

export async function listSubscriptionPaymentsForUser(
  userId: string,
): Promise<SubscriptionPayment[]> {
  const [user, subscription] = await Promise.all([
    db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      columns: { stripeBillingCustomerId: true },
    }),
    db.query.userBillingSubscription.findFirst({
      where: eq(userBillingSubscription.userId, userId),
      columns: { stripeSubscriptionId: true },
    }),
  ]);

  if (!user?.stripeBillingCustomerId) {
    return [];
  }

  try {
    const invoices = await stripe.invoices.list({
      customer: user.stripeBillingCustomerId,
      ...(subscription?.stripeSubscriptionId
        ? { subscription: subscription.stripeSubscriptionId }
        : {}),
      limit: PAYMENT_HISTORY_LIMIT,
    });

    return invoices.data.flatMap((invoice) => {
      const status = mapInvoiceStatus(invoice.status);
      if (!status) {
        return [];
      }

      const amountCents =
        status === "paid"
          ? (invoice.amount_paid ?? 0)
          : (invoice.amount_due ?? invoice.total ?? 0);

      return [
        {
          id: invoice.id,
          date: new Date(invoice.created * 1000).toISOString(),
          amountCents,
          currency: invoice.currency ?? "brl",
          status,
          invoiceUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
        },
      ];
    });
  } catch (error) {
    console.error("[stripe-billing] Falha ao listar faturas:", error);
    return [];
  }
}
