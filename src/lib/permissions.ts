import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

/**
 * make sure to use `as const` so typescript can infer the type correctly
 */
const statement = {
  ...defaultStatements,
  organization: ["update", "delete"],
  member: ["create", "share", "update", "delete"],
  match: ["create", "share", "update", "delete", "join"],
  score: ["update"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "share", "update", "delete"],
  match: ["create", "share", "update", "delete", "join"],
  score: ["update"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
});

export const member = ac.newRole({
  member: ["share"],
  match: ["share", "join"],
  score: [],
});

export const guest = ac.newRole({
  member: ["share"],
  match: ["share", "join"],
  score: [],
});

export const admin = ac.newRole({
  organization: ["update"],
  member: ["create", "share", "update", "delete"],
  match: ["create", "share", "update", "delete", "join"],
  score: ["update"],
});
