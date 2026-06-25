import type { UserBillingSubscription } from "@/db/schema/user-billing";

export function getGracePeriodDays(): number {
  const raw = process.env.PLAN_GRACE_PERIOD_DAYS;
  const parsed = raw ? Number.parseInt(raw, 10) : 3;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
}

export function isSubscriptionEffectivelyActive(
  record: Pick<
    UserBillingSubscription,
    "status" | "gracePeriodEndsAt"
  >,
): boolean {
  if (record.status === "active" || record.status === "trialing") {
    return true;
  }

  if (record.status === "past_due") {
    if (!record.gracePeriodEndsAt) return false;
    return new Date() < record.gracePeriodEndsAt;
  }

  return false;
}
