import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { usersTable } from "./user";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "cancelled",
]);

// ── Plano mensal por grupo ────────────────────────────────────────────────
// Cada grupo tem no máximo um plano ativo; ao alterar o preço,
// o plano antigo é desativado e um novo é criado.

export const membershipPlansTable = pgTable("membership_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  stripeProductId: text("stripe_product_id").notNull(),
  stripePriceId: text("stripe_price_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const membershipPlansRelations = relations(
  membershipPlansTable,
  ({ one }) => ({
    organization: one(organization, {
      fields: [membershipPlansTable.organizationId],
      references: [organization.id],
    }),
  }),
);

// ── Assinaturas dos membros ────────────────────────────────────────────────
// Um registro por membro por grupo. Renovações atualizam currentPeriodEnd.

export const memberSubscriptionsTable = pgTable("member_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  cancelledAt: timestamp("cancelled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const memberSubscriptionsRelations = relations(
  memberSubscriptionsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [memberSubscriptionsTable.userId],
      references: [usersTable.id],
    }),
    organization: one(organization, {
      fields: [memberSubscriptionsTable.organizationId],
      references: [organization.id],
    }),
  }),
);
