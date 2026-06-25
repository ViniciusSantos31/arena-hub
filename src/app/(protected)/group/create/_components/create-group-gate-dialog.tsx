"use client";

import {
  PlanPickerDialog,
  type PlanPickerReason,
} from "@/app/(protected)/_components/plan-picker-dialog";
import type { PlanTier } from "@/lib/user-plan/types";
import { redirect } from "next/navigation";

type CreateGroupGateDialogProps = {
  reason: PlanPickerReason;
  currentTier?: PlanTier;
  ownedGroups: number;
};

export function CreateGroupGateDialog({
  reason,
  currentTier,
  ownedGroups,
}: CreateGroupGateDialogProps) {
  return (
    <PlanPickerDialog
      open
      reason={reason}
      currentTier={currentTier}
      ownedGroups={ownedGroups}
      onOpenChange={(open) => {
        if (!open) redirect("/home");
      }}
    />
  );
}
