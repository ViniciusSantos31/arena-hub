import { db } from "@/db";
import type { PlanTier } from "./types";
import {
  EARLY_ADOPTER_FREE_GROUPS,
  PLAN_LIMITS,
} from "./plan-tiers";
import {
  countActiveInviteLinksForOwner,
  countOwnedGroups,
} from "./queries";
import { isSubscriptionEffectivelyActive } from "./subscription-status";
import type { PlanLimits, UserPlanContext } from "./types";

export function resolveGroupLimit(ctx: UserPlanContext): number {
  if (ctx.subscription?.isEffectivelyActive) {
    return PLAN_LIMITS[ctx.subscription.planTier].maxGroups;
  }
  if (ctx.isEarlyAdopter) return EARLY_ADOPTER_FREE_GROUPS;
  return 0;
}

export function shouldEnforcePlanMemberAndLinkLimits(
  ctx: UserPlanContext,
): boolean {
  return ctx.subscription?.isEffectivelyActive === true;
}

function resolveEffectiveLimits(ctx: {
  isEarlyAdopter: boolean;
  subscription: UserPlanContext["subscription"];
}): PlanLimits {
  if (ctx.subscription?.isEffectivelyActive) {
    return PLAN_LIMITS[ctx.subscription.planTier];
  }

  return {
    maxGroups: ctx.isEarlyAdopter ? EARLY_ADOPTER_FREE_GROUPS : 0,
    maxMembersPerGroup: null,
    maxInviteLinksTotal: null,
  };
}

export async function getUserPlanContext(
  userId: string,
): Promise<UserPlanContext> {
  const [user, subscription, ownedGroups, activeInviteLinks] =
    await Promise.all([
      db.query.usersTable.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        columns: {
          isEarlyAdopter: true,
        },
      }),
      db.query.userBillingSubscription.findFirst({
        where: (subs, { eq }) => eq(subs.userId, userId),
      }),
      countOwnedGroups(userId),
      countActiveInviteLinksForOwner(userId),
    ]);

  const subscriptionContext = subscription
    ? {
        planTier: subscription.planTier as PlanTier,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        isEffectivelyActive: isSubscriptionEffectivelyActive(subscription),
      }
    : null;

  const isEarlyAdopter = user?.isEarlyAdopter ?? false;

  const ctx: UserPlanContext = {
    userId,
    isEarlyAdopter,
    subscription: subscriptionContext,
    limits: { maxGroups: 0, maxMembersPerGroup: null, maxInviteLinksTotal: null },
    usage: {
      ownedGroups,
      activeInviteLinks,
    },
  };

  ctx.limits = resolveEffectiveLimits(ctx);

  return ctx;
}
