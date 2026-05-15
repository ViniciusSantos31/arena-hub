import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { matchesTable } from "./match";
import { member } from "./member";
import { usersTable } from "./user";

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "refunded",
  "exempt",
]);

export const playersTable = pgTable("player", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  matchId: text("match_id").references(() => matchesTable.id, {
    onDelete: "cascade",
  }),
  teamId: integer("team_id"),
  memberId: text("member_id").references(() => member.id, {
    onDelete: "cascade",
  }),
  confirmed: boolean("confirmed").notNull().default(false),
  waitingQueue: boolean("waiting_queue").notNull().default(false),

  // Moderator removal
  removedByModerator: boolean("removed_by_moderator").notNull().default(false),
  removalReason: text("removal_reason"),
  bannedFromMatch: boolean("banned_from_match").notNull().default(false),

  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const playersRelations = relations(playersTable, ({ one }) => ({
  match: one(matchesTable, {
    fields: [playersTable.matchId],
    references: [matchesTable.id],
  }),
  user: one(usersTable, {
    fields: [playersTable.userId],
    references: [usersTable.id],
  }),
  member: one(member, {
    fields: [playersTable.memberId],
    references: [member.id],
  }),
}));
