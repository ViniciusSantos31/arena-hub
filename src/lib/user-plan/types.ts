export type PlanTier = "basic" | "intermediate" | "premium";

export type PlanLimits = {
  maxGroups: number;
  maxMembersPerGroup: number | null;
  maxInviteLinksTotal: number | null;
};

export type UserPlanContext = {
  userId: string;
  isEarlyAdopter: boolean;
  subscription: {
    planTier: PlanTier;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    isEffectivelyActive: boolean;
  } | null;
  limits: PlanLimits;
  usage: {
    ownedGroups: number;
    activeInviteLinks: number;
  };
};

export type PlanErrorCode =
  | "PLAN_REQUIRED"
  | "GROUP_LIMIT"
  | "EARLY_ADOPTER_GROUP_LIMIT"
  | "MEMBER_LIMIT"
  | "INVITE_LINK_LIMIT"
  | "MAX_PLAYERS_EXCEEDS_PLAN";
