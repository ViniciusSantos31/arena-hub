import {
  getUserPlanContext,
  resolveGroupLimit,
  shouldEnforcePlanMemberAndLinkLimits,
} from "./get-user-plan-context";
import { PlanLimitError } from "./plan-limit-error";
import { EARLY_ADOPTER_FREE_GROUPS } from "./plan-tiers";
import {
  getOrganizationMaxPlayers,
  getOrganizationOwnerUserId,
} from "./queries";
import type { UserPlanContext } from "./types";

export function assertCanCreateGroup(ctx: UserPlanContext): void {
  const limit = resolveGroupLimit(ctx);

  if (limit === 0) {
    throw new PlanLimitError(
      "PLAN_REQUIRED",
      "Assine um plano para criar seu grupo.",
    );
  }

  if (ctx.usage.ownedGroups >= limit) {
    if (
      ctx.isEarlyAdopter &&
      !ctx.subscription?.isEffectivelyActive &&
      ctx.usage.ownedGroups >= EARLY_ADOPTER_FREE_GROUPS
    ) {
      throw new PlanLimitError(
        "EARLY_ADOPTER_GROUP_LIMIT",
        "Você é um Early Adopter e pode criar até 2 grupos sem assinatura. Para criar um terceiro grupo, assine um dos nossos planos.",
        { ownedGroups: ctx.usage.ownedGroups, limit },
      );
    }

    throw new PlanLimitError(
      "GROUP_LIMIT",
      `Seu plano permite até ${limit} grupo(s). Faça upgrade para criar mais.`,
      { ownedGroups: ctx.usage.ownedGroups, limit },
    );
  }
}

export function assertCanSetMaxPlayers(
  ctx: UserPlanContext,
  maxPlayers: number,
): void {
  if (!shouldEnforcePlanMemberAndLinkLimits(ctx)) return;

  const planCap = ctx.limits.maxMembersPerGroup;
  if (planCap !== null && maxPlayers > planCap) {
    throw new PlanLimitError(
      "MAX_PLAYERS_EXCEEDS_PLAN",
      `Seu plano permite no máximo ${planCap} membros por grupo.`,
      { maxPlayers, planCap },
    );
  }
}

export function assertCanAddMemberToGroup(
  ctx: UserPlanContext,
  currentMemberCount: number,
  organizationMaxPlayers: number,
): void {
  const cap = getEffectiveMemberCap(ctx, organizationMaxPlayers);
  if (cap !== null && currentMemberCount >= cap) {
    throw new PlanLimitError(
      "MEMBER_LIMIT",
      "Este grupo atingiu o limite de membros do plano do organizador.",
      { currentMemberCount, cap },
    );
  }
}

export function assertCanCreateInviteLink(ctx: UserPlanContext): void {
  if (!shouldEnforcePlanMemberAndLinkLimits(ctx)) return;

  const cap = ctx.limits.maxInviteLinksTotal;
  if (cap !== null && ctx.usage.activeInviteLinks >= cap) {
    throw new PlanLimitError(
      "INVITE_LINK_LIMIT",
      `Seu plano permite até ${cap} links de convite ativos. Revogue links existentes ou faça upgrade.`,
      { activeInviteLinks: ctx.usage.activeInviteLinks, cap },
    );
  }
}

function getEffectiveMemberCap(
  ctx: UserPlanContext,
  organizationMaxPlayers: number,
): number | null {
  if (!shouldEnforcePlanMemberAndLinkLimits(ctx)) {
    return organizationMaxPlayers;
  }

  const planCap = ctx.limits.maxMembersPerGroup;
  if (planCap === null) return organizationMaxPlayers;

  return Math.min(organizationMaxPlayers, planCap);
}

export async function getEffectiveMemberCapForOrganization(
  organizationId: string,
): Promise<number | null> {
  const ownerUserId = await getOrganizationOwnerUserId(organizationId);
  if (!ownerUserId) return null;

  const [ctx, orgMaxPlayers] = await Promise.all([
    getUserPlanContext(ownerUserId),
    getOrganizationMaxPlayers(organizationId),
  ]);

  return getEffectiveMemberCap(ctx, orgMaxPlayers);
}

export async function getOwnerPlanContextForOrganization(
  organizationId: string,
): Promise<UserPlanContext | null> {
  const ownerUserId = await getOrganizationOwnerUserId(organizationId);
  if (!ownerUserId) return null;
  return getUserPlanContext(ownerUserId);
}
