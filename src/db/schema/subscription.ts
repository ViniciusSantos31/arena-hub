import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const pushSubscriptionsTable = pgTable("push_subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(), // referencia ao user do Better Auth
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(), // chave pública da subscription
  auth: text("auth").notNull(), // chave de autenticação
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptionsTable.$inferInsert;
