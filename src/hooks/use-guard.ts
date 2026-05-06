import { useMemberStore } from "@/app/(protected)/group/[code]/_store/group";
import { roleHasActions, type GroupAction } from "@/lib/group-permissions";
import { Role } from "@/utils/role";
import { useCallback } from "react";

interface Member {
  id: string;
  role: Role | null;
}

interface UseGuardProps {
  action: Array<GroupAction>;
}

export const useGuard = ({ action }: UseGuardProps) => {
  const canPerformAction = useCallback(
    (member: Member | null) => {
      if (!member || !member.role) return false;
      return roleHasActions(member.role, action);
    },
    [action],
  );

  const memberStore = useMemberStore();

  return canPerformAction(memberStore.member);
};

export const can = (member: Member | null, action: GroupAction[]) => {
  if (!member || !member.role) return false;
  return roleHasActions(member.role, action);
};
