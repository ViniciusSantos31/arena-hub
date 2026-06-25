import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { playersTable } from "./player";
import { requestsTable } from "./request";
import { userBillingSubscription } from "./user-billing";

export const usersTable = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  bio: text("bio"),
  location: text("location"),
  lookingForGroup: boolean("looking_for_group").notNull().default(false),
  isEarlyAdopter: boolean("is_early_adopter").notNull().default(false),
  earlyAdopterGrantedAt: timestamp("early_adopter_granted_at"),
  stripeBillingCustomerId: text("stripe_billing_customer_id"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  players: many(playersTable),
  requests: many(requestsTable),
  billingSubscription: one(userBillingSubscription),
}));
