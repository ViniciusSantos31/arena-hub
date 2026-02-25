"use client";

import { UpgradePlanDialog } from "@/app/(protected)/_components/upgrade-plan-dialog";
import { redirect } from "next/navigation";

export const GroupLimitDialog = ({ groupsCount }: { groupsCount: number }) => {
  if (groupsCount < 2) return null;

  return (
    <UpgradePlanDialog
      feature="unlimited_groups"
      open
      onOpenChange={() => redirect("/home")}
    />
  );
};
