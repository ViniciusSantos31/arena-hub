import {
  ResponsiveDialogBaseProps,
} from "@/components/responsive-dialog";
import type { PlanTier } from "@/lib/user-plan/types";
import { PlanPickerDialog } from "./plan-picker-dialog";

type FeatureKey = "unlimited_groups" | "join_groups";

type UpgradePlanDialogProps = {
  feature?: FeatureKey;
  reason?: "plan_required" | "group_limit" | "early_adopter_limit" | "upgrade";
  currentTier?: PlanTier;
  ownedGroups?: number;
} & ResponsiveDialogBaseProps;

export const UpgradePlanDialog = ({
  open,
  onOpenChange,
  reason = "upgrade",
  currentTier,
  ownedGroups,
}: UpgradePlanDialogProps) => {
  return (
    <PlanPickerDialog
      open={open}
      onOpenChange={onOpenChange}
      reason={reason}
      currentTier={currentTier}
      ownedGroups={ownedGroups}
    />
  );
};
