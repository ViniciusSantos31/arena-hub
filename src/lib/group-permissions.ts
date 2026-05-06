import type { Role } from "@/utils/role";

export type GroupAction =
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
  | "membership:approve"
  | "group:settings"
  | "group:links";

const ROLE_ACTIONS: Record<Role, GroupAction[]> = {
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
    "group:settings",
    "group:links",
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
    "membership:approve",
    "group:settings",
    "group:links",
  ],
  member: ["match:read", "match:join"],
  guest: ["match:read", "match:join_queue"],
};

export function roleHasActions(role: Role | null | undefined, actions: GroupAction[]) {
  if (!role) return false;
  const allowed = ROLE_ACTIONS[role] ?? [];
  return actions.every((a) => allowed.includes(a));
}

