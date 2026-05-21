import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { member, roleEnum } from "./member";

export const organizationPaymentExemptions = pgTable(
  "organization_payment_exemption",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    memberId: text("member_id").references(() => member.id, {
      onDelete: "cascade",
    }),
    role: roleEnum(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
);

export const organizationPaymentExemptionsRelations = relations(
  organizationPaymentExemptions,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationPaymentExemptions.organizationId],
      references: [organization.id],
    }),
    member: one(member, {
      fields: [organizationPaymentExemptions.memberId],
      references: [member.id],
    }),
  }),
);
