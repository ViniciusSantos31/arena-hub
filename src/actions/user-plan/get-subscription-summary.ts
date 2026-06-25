"use server";

import {
  getUserPlanContext,
  resolveGroupLimit,
} from "@/lib/user-plan/get-user-plan-context";
import type { PlanLimits, PlanTier } from "@/lib/user-plan/types";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";

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

export const getSubscriptionSummary = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const ctx = await getUserPlanContext(session.user.id);

  const summary: SubscriptionSummary = {
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

  return summary;
});
