import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { usersTable } from "./user";

export const inviteDefaultRoleEnum = pgEnum("invite_default_role", [
  "guest",
  "member",
]);

export const organizationInviteLink = pgTable(
  "organization_invite_link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    label: text("label"),
    tokenHash: text("token_hash").notNull(),
    tokenCiphertext: text("token_ciphertext").notNull(),
    tokenIv: text("token_iv").notNull(),
    tokenTag: text("token_tag").notNull(),
    defaultRole: inviteDefaultRoleEnum("default_role")
      .notNull()
      .default("guest"),
    expiresAt: timestamp("expires_at"),
    maxUses: integer("max_uses"),

    createdBy: text("created_by")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),

    revokedAt: timestamp("revoked_at"),
    revokedBy: text("revoked_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    revokedReason: text("revoked_reason"),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex("organization_invite_link_token_hash_ux").on(
      t.tokenHash,
    ),
    orgActiveLookupIdx: index("organization_invite_link_org_active_idx").on(
      t.organizationId,
      t.revokedAt,
      t.expiresAt,
    ),
  }),
);

export const organizationInviteLinkUse = pgTable(
  "organization_invite_link_use",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    inviteLinkId: text("invite_link_id")
      .notNull()
      .references(() => organizationInviteLink.id, { onDelete: "cascade" }),
    usedByUserId: text("used_by_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    usedAt: timestamp("used_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
  },
  (t) => ({
    inviteLinkUsedAtIdx: index("organization_invite_link_use_used_at_idx").on(
      t.inviteLinkId,
      t.usedAt,
    ),
  }),
);

export const organizationInviteLinkRelations = relations(
  organizationInviteLink,
  ({ one, many }) => ({
    organization: one(organization, {
      fields: [organizationInviteLink.organizationId],
      references: [organization.id],
    }),
    creator: one(usersTable, {
      fields: [organizationInviteLink.createdBy],
      references: [usersTable.id],
    }),
    revoker: one(usersTable, {
      fields: [organizationInviteLink.revokedBy],
      references: [usersTable.id],
    }),
    uses: many(organizationInviteLinkUse),
  }),
);

export const organizationInviteLinkUseRelations = relations(
  organizationInviteLinkUse,
  ({ one }) => ({
    inviteLink: one(organizationInviteLink, {
      fields: [organizationInviteLinkUse.inviteLinkId],
      references: [organizationInviteLink.id],
    }),
    usedBy: one(usersTable, {
      fields: [organizationInviteLinkUse.usedByUserId],
      references: [usersTable.id],
    }),
  }),
);
