import { getUserPlanContext, resolveGroupLimit } from "./get-user-plan-context";
import type { PlanLimits, PlanTier, UserPlanContext } from "./types";

export type SubscriptionSummary = {
  isEarlyAdopter: boolean;
  subscription: {
    planTier: PlanTier;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    isEffectivelyActive: boolean;
  } | null;
  limits: PlanLimits;
  usage: {
    ownedGroups: number;
    activeInviteLinks: number;
  };
  groupLimit: number;
};

export function buildSubscriptionSummary(
  ctx: UserPlanContext,
): SubscriptionSummary {
  return {
    isEarlyAdopter: ctx.isEarlyAdopter,
    subscription: ctx.subscription
      ? {
          planTier: ctx.subscription.planTier,
          status: ctx.subscription.status,
          currentPeriodEnd: ctx.subscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: ctx.subscription.cancelAtPeriodEnd,
          isEffectivelyActive: ctx.subscription.isEffectivelyActive,
        }
      : null,
    limits: ctx.limits,
    usage: ctx.usage,
    groupLimit: resolveGroupLimit(ctx),
  };
}

export async function getSubscriptionSummaryForUser(
  userId: string,
): Promise<SubscriptionSummary> {
  const ctx = await getUserPlanContext(userId);
  return buildSubscriptionSummary(ctx);
}
