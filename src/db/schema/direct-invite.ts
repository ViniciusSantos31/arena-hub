import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { organizationInviteLink } from "./invite-link";
import { usersTable } from "./user";

export const directInviteStatusEnum = pgEnum("direct_invite_status", [
  "pending",
  "accepted",
  "declined",
]);

export const directInvitesTable = pgTable(
  "direct_invite",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    inviteLinkId: text("invite_link_id").references(
      () => organizationInviteLink.id,
      { onDelete: "cascade" },
    ),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    sentByUserId: text("sent_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    status: directInviteStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    targetUserIdx: index("direct_invite_target_user_idx").on(
      t.targetUserId,
      t.status,
    ),
    orgTargetIdx: index("direct_invite_org_target_idx").on(
      t.organizationId,
      t.targetUserId,
    ),
  }),
);

export const directInviteRelations = relations(
  directInvitesTable,
  ({ one }) => ({
    inviteLink: one(organizationInviteLink, {
      fields: [directInvitesTable.inviteLinkId],
      references: [organizationInviteLink.id],
    }),
    organization: one(organization, {
      fields: [directInvitesTable.organizationId],
      references: [organization.id],
    }),
    targetUser: one(usersTable, {
      fields: [directInvitesTable.targetUserId],
      references: [usersTable.id],
      relationName: "receivedInvites",
    }),
    sentBy: one(usersTable, {
      fields: [directInvitesTable.sentByUserId],
      references: [usersTable.id],
      relationName: "sentInvites",
    }),
  }),
);
