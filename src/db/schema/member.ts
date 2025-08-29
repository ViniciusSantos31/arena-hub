import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizationsTable } from "./auth";
import { usersTable } from "./user";

export const roleEnum = pgEnum("member_role", [
  "owner",
  "member",
  "admin",
  "guest",
]);

export const membersTable = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizationsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: roleEnum().default("member"),
  createdAt: timestamp("created_at").notNull(),
});
