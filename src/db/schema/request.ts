import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { usersTable } from "./user";

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const requestsTable = pgTable("requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  message: text("message"),
  reviewedBy: text("reviewed_by").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  status: requestStatusEnum("status").notNull().default("pending"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const requestsRelations = relations(requestsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [requestsTable.userId],
    references: [usersTable.id],
  }),
  organization: one(organization, {
    fields: [requestsTable.organizationId],
    references: [organization.id],
  }),
  reviewer: one(usersTable, {
    fields: [requestsTable.reviewedBy],
    references: [usersTable.id],
  }),
}));
