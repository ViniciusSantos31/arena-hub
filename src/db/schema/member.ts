import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { usersTable } from "./user";

export const roleEnum = pgEnum("member_role", [
  "owner",
  "member",
  "admin",
  "guest",
]);

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  role: roleEnum().default("member"),
  createdAt: timestamp("created_at").notNull(),
});
