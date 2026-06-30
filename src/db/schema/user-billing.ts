import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const planTierEnum = pgEnum("plan_tier", [
  "basic",
  "intermediate",
  "premium",
]);

export const subscriptionStatusEnum = pgEnum("billing_subscription_status", [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
]);

export const userBillingSubscription = pgTable("user_billing_subscription", {
  userId: text("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  planTier: planTierEnum("plan_tier").notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  gracePeriodEndsAt: timestamp("grace_period_ends_at"),
  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

export const stripeProcessedEvent = pgTable("stripe_processed_event", {
  eventId: text("event_id").primaryKey(),
  type: text("type").notNull(),
  processedAt: timestamp("processed_at")
    .notNull()
    .$defaultFn(() => new Date()),
});

export const userBillingSubscriptionRelations = relations(
  userBillingSubscription,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userBillingSubscription.userId],
      references: [usersTable.id],
    }),
  }),
);

export type UserBillingSubscription =
  typeof userBillingSubscription.$inferSelect;
export type NewUserBillingSubscription =
  typeof userBillingSubscription.$inferInsert;
