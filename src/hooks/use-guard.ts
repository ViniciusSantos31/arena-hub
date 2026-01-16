import { useMemberStore } from "@/app/(protected)/group/[code]/_store/group";
import { Role } from "@/utils/role";
import { useCallback } from "react";

interface Member {
  id: string;
  role: Role | null;
}

interface UseGuardProps {
  action: Array<ALL_PERMISSIONS>;
}

type ALL_PERMISSIONS =
  | "match:create"
  | "match:read"
  | "match:join"
  | "match:update"
  | "match:delete"
  | "team:create"
  | "team:update"
  | "match:join_queue"
  | "membership:update"
  | "membership:delete"
  | "membership:approve";

const ROLE_PERMISSIONS: Record<Role, ALL_PERMISSIONS[]> = {
  owner: [
    "match:create",
    "match:read",
    "match:join",
    "match:update",
    "match:delete",
    "team:create",
    "team:update",
    "membership:update",
    "membership:delete",
    "membership:approve",
  ],
  admin: [
    "match:create",
    "match:read",
    "match:join",
    "match:update",
    "match:delete",
    "team:create",
    "team:update",
    "membership:update",
  ],
  member: ["match:read", "match:join"],
  guest: ["match:read", "match:join_queue"],
};

export const useGuard = ({ action }: UseGuardProps) => {
  const canPerformAction = useCallback(
    (member: Member | null) => {
      if (!member || !member.role) return false;

      const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
      return action.every((act) => rolePermissions.includes(act));
    },
    [action],
  );

  const memberStore = useMemberStore();

  return canPerformAction(memberStore.member);
};

export const can = (member: Member | null, action: ALL_PERMISSIONS[]) => {
  if (!member || !member.role) return false;

  const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
  return action.every((act) => rolePermissions.includes(act));
};
