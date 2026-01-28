import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { playersTable } from "./player";
import { usersTable } from "./user";

export const roleEnum = pgEnum("member_role", [
  "member",
  "admin",
  "guest",
  "owner",
]);

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  score: integer().notNull().default(25),
  role: roleEnum().default("member"),
  createdAt: timestamp("created_at").notNull(),
});

export const memberRelation = relations(member, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [member.userId],
    references: [usersTable.id],
  }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  players: many(playersTable),
}));
