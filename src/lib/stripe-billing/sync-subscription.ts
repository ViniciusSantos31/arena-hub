import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import {
  userBillingSubscription,
  type UserBillingSubscription,
} from "@/db/schema/user-billing";
import { priceIdToPlanTier } from "@/lib/stripe-billing/map-price-to-tier";
import { getGracePeriodDays } from "@/lib/user-plan/subscription-status";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

type BillingSubscriptionStatus = UserBillingSubscription["status"];

const STRIPE_STATUSES: ReadonlySet<string> = new Set([
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
]);

function toBillingStatus(
  status: Stripe.Subscription.Status,
): BillingSubscriptionStatus {
  if (STRIPE_STATUSES.has(status)) {
    return status as BillingSubscriptionStatus;
  }
  return "canceled";
}

function isScheduledCancellation(sub: Stripe.Subscription): boolean {
  return sub.status === "active" || sub.status === "trialing";
}

/**
 * Basil/dahlia API: o portal agenda cancelamento via `cancel_at` (timestamp)
 * em vez de `cancel_at_period_end: true`.
 */
function resolveCancelAtPeriodEnd(sub: Stripe.Subscription): boolean {
  if (sub.cancel_at_period_end) {
    return true;
  }

  if (sub.cancel_at == null) {
    return false;
  }

  return isScheduledCancellation(sub);
}

function getSubscriptionPeriod(sub: Stripe.Subscription): {
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
} {
  const item = sub.items.data[0];
  const legacySub = sub as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };
  const periodStart =
    legacySub.current_period_start ?? item?.current_period_start;
  let periodEnd = legacySub.current_period_end ?? item?.current_period_end;

  if (sub.cancel_at != null && isScheduledCancellation(sub)) {
    periodEnd = sub.cancel_at;
  }

  if (!periodStart || !periodEnd) {
    throw new Error(
      `[stripe-billing] Subscription sem período de cobrança: ${sub.id}`,
    );
  }

  return {
    currentPeriodStart: new Date(periodStart * 1000),
    currentPeriodEnd: new Date(periodEnd * 1000),
  };
}

function computeGracePeriodEndsAt(
  status: BillingSubscriptionStatus,
  existingGracePeriodEndsAt: Date | null,
): Date | null {
  if (status !== "past_due") {
    return null;
  }

  if (existingGracePeriodEndsAt && existingGracePeriodEndsAt > new Date()) {
    return existingGracePeriodEndsAt;
  }

  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + getGracePeriodDays());
  return endsAt;
}

export async function syncSubscriptionFromStripe(
  sub: Stripe.Subscription,
  userId: string,
  options?: { statusOverride?: BillingSubscriptionStatus },
): Promise<void> {
  const priceId = sub.items.data[0]?.price?.id;
  if (!priceId) {
    console.error("[stripe-billing] Subscription sem price item:", sub.id);
    return;
  }

  const planTier = priceIdToPlanTier(priceId);
  if (!planTier) {
    console.error(
      "[stripe-billing] Price ID desconhecido:",
      priceId,
      "subscription:",
      sub.id,
    );
    return;
  }

  const status = options?.statusOverride ?? toBillingStatus(sub.status);

  const existing = await db.query.userBillingSubscription.findFirst({
    where: eq(userBillingSubscription.userId, userId),
    columns: { gracePeriodEndsAt: true },
  });

  const gracePeriodEndsAt = computeGracePeriodEndsAt(
    status,
    existing?.gracePeriodEndsAt ?? null,
  );

  const { currentPeriodStart, currentPeriodEnd } = getSubscriptionPeriod(sub);
  const cancelAtPeriodEnd = resolveCancelAtPeriodEnd(sub);

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id;

  if (customerId) {
    await db
      .update(usersTable)
      .set({
        stripeBillingCustomerId: customerId,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  await db
    .insert(userBillingSubscription)
    .values({
      userId,
      stripeSubscriptionId: sub.id,
      planTier,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      gracePeriodEndsAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: userBillingSubscription.userId,
      set: {
        stripeSubscriptionId: sub.id,
        planTier,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        gracePeriodEndsAt,
        updatedAt: new Date(),
      },
    });
}
