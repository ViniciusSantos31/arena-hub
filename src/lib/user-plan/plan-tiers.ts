import type { PlanLimits, PlanTier } from "./types";

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  basic: { maxGroups: 1, maxMembersPerGroup: 30, maxInviteLinksTotal: 3 },
  intermediate: {
    maxGroups: 3,
    maxMembersPerGroup: 100, // TODO: change to 60
    maxInviteLinksTotal: 6,
  },
  premium: {
    maxGroups: 10,
    maxMembersPerGroup: null,
    maxInviteLinksTotal: null,
  },
};

export const EARLY_ADOPTER_FREE_GROUPS = 2;

export const PLAN_TIER_LABELS: Record<PlanTier, string> = {
  basic: "Básico",
  intermediate: "Intermediário",
  premium: "Premium",
};

export const PLAN_TIER_PRICES: Record<PlanTier, string> = {
  basic: "R$ 5,00",
  intermediate: "R$ 15,00",
  premium: "R$ 50,00",
};

export const PLAN_TIERS: PlanTier[] = ["basic", "intermediate", "premium"];
