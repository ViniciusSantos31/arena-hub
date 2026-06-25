import { db } from "@/db";
import {
  stripeProcessedEvent,
  userBillingSubscription,
} from "@/db/schema/user-billing";
import { usersTable } from "@/db/schema/user";
import { syncSubscriptionFromStripe } from "@/lib/stripe-billing/sync-subscription";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subscription = invoice.parent?.subscription_details?.subscription;
  if (!subscription) {
    return null;
  }

  return typeof subscription === "string" ? subscription : subscription.id;
}

const BILLING_WEBHOOK_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

async function resolveUserIdFromSubscription(
  sub: Stripe.Subscription,
): Promise<string | null> {
  if (sub.metadata?.userId) {
    return sub.metadata.userId;
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  if (customerId) {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.stripeBillingCustomerId, customerId),
      columns: { id: true },
    });
    if (user) {
      return user.id;
    }
  }

  const existing = await db.query.userBillingSubscription.findFirst({
    where: eq(userBillingSubscription.stripeSubscriptionId, sub.id),
    columns: { userId: true },
  });

  return existing?.userId ?? null;
}

async function isPlatformBillingSubscription(
  sub: Stripe.Subscription,
): Promise<boolean> {
  if (sub.metadata?.userId) {
    return true;
  }

  const existing = await db.query.userBillingSubscription.findFirst({
    where: eq(userBillingSubscription.stripeSubscriptionId, sub.id),
    columns: { userId: true },
  });

  return Boolean(existing);
}

async function shouldHandleBillingEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case "checkout.session.completed": {
      const sess = event.data.object as Stripe.Checkout.Session;
      return sess.metadata?.type === "platform_subscription";
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      return isPlatformBillingSubscription(sub);
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (!subscriptionId) {
        return false;
      }

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      return isPlatformBillingSubscription(sub);
    }
    default:
      return false;
  }
}

async function dispatchBillingEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const sess = event.data.object as Stripe.Checkout.Session;
      const userId = sess.metadata?.userId;
      const subscriptionId =
        typeof sess.subscription === "string"
          ? sess.subscription
          : sess.subscription?.id;

      if (!userId || !subscriptionId) {
        return;
      }

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscriptionFromStripe(sub, userId);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await resolveUserIdFromSubscription(sub);
      if (!userId) {
        return;
      }
      await syncSubscriptionFromStripe(sub, userId);
      return;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = getInvoiceSubscriptionId(invoice);

      if (!subscriptionId) {
        return;
      }

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = await resolveUserIdFromSubscription(sub);
      if (!userId) {
        return;
      }

      await syncSubscriptionFromStripe(sub, userId, {
        statusOverride: "past_due",
      });
      return;
    }
  }
}

export async function handleStripeBillingWebhook(
  event: Stripe.Event,
): Promise<"handled" | "ignored"> {
  if (!BILLING_WEBHOOK_TYPES.has(event.type)) {
    return "ignored";
  }

  if (!(await shouldHandleBillingEvent(event))) {
    return "ignored";
  }

  const [claimed] = await db
    .insert(stripeProcessedEvent)
    .values({
      eventId: event.id,
      type: event.type,
    })
    .onConflictDoNothing()
    .returning();

  if (!claimed) {
    return "handled";
  }

  try {
    await dispatchBillingEvent(event);
  } catch (error) {
    await db
      .delete(stripeProcessedEvent)
      .where(eq(stripeProcessedEvent.eventId, event.id));
    throw error;
  }

  return "handled";
}
