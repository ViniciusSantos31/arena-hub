import { useCallback } from "react";

interface Member {
  id: string;
  role: "member" | "admin" | "guest" | "owner" | null;
}

interface UseGuardProps {
  action: string;
}

const ROLE_PERMISSIONS: Record<
  "member" | "admin" | "guest" | "owner",
  readonly string[]
> = {
  owner: [
    "match:create",
    "match:read",
    "match:join",
    "match:update",
    "match:delete",
    "team:create",
    "team:update",
  ],
  admin: [
    "match:create",
    "match:read",
    "match:update",
    "match:delete",
    "team:create",
    "team:update",
  ],
  member: ["match:read", "match:join"],
  guest: ["match:read", "match:join_queue"],
} as const;

export const useGuard = ({ action }: UseGuardProps) => {
  const canPerformAction = useCallback(
    (member: Member | null) => {
      if (!member || !member.role) return false;

      // Check role-based permissions
      const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
      return rolePermissions.includes(action);
    },
    [action],
  );

  return canPerformAction;
};
