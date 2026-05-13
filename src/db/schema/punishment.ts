import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { organization } from "./auth";
import { member } from "./member";
import { usersTable } from "./user";

export const punishmentTable = pgTable("punishment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  memberId: text("member_id").references(() => member.id, {
    onDelete: "cascade",
  }),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  reason: text("reason"),
  appliedByUserId: text("applied_by_user_id").references(
    () => usersTable.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const punishmentRelations = relations(punishmentTable, ({ one }) => ({
  member: one(member, {
    fields: [punishmentTable.memberId],
    references: [member.id],
  }),
  organization: one(organization, {
    fields: [punishmentTable.organizationId],
    references: [organization.id],
  }),
  appliedBy: one(usersTable, {
    fields: [punishmentTable.appliedByUserId],
    references: [usersTable.id],
  }),
}));
