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
  | "MAX_PLAYERS_EXCEEDS_PLAN"
  | "SUBSCRIPTION_REQUIRED_FOR_MATCH";

export type PlanPickerReason =
  | "plan_required"
  | "group_limit"
  | "early_adopter_limit"
  | "upgrade"
  | "subscription_required_for_match";
