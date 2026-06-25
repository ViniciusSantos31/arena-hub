import { auth } from "@/lib/auth";
import {
  getUserPlanContext,
  resolveGroupLimit,
} from "@/lib/user-plan/get-user-plan-context";
import { EARLY_ADOPTER_FREE_GROUPS } from "@/lib/user-plan/plan-tiers";
import type { PlanTier } from "@/lib/user-plan/types";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { PlanPickerReason } from "@/app/(protected)/_components/plan-picker-dialog";
import { CreateGroupGateDialog } from "./create-group-gate-dialog";

function resolveGateReason(
  ctx: Awaited<ReturnType<typeof getUserPlanContext>>,
  limit: number,
): PlanPickerReason {
  if (limit === 0) {
    return "plan_required";
  }

  if (
    ctx.isEarlyAdopter &&
    !ctx.subscription?.isEffectivelyActive &&
    ctx.usage.ownedGroups >= EARLY_ADOPTER_FREE_GROUPS
  ) {
    return "early_adopter_limit";
  }

  if (ctx.subscription?.isEffectivelyActive) {
    return "upgrade";
  }

  return "group_limit";
}

export async function CreateGroupGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const ctx = await getUserPlanContext(session.user.id);
  const limit = resolveGroupLimit(ctx);
  const canCreate = ctx.usage.ownedGroups < limit;

  if (canCreate) {
    return <>{children}</>;
  }

  const reason = resolveGateReason(ctx, limit);
  const currentTier = ctx.subscription?.planTier as PlanTier | undefined;

  return (
    <CreateGroupGateDialog
      reason={reason}
      currentTier={currentTier}
      ownedGroups={ctx.usage.ownedGroups}
    />
  );
}
