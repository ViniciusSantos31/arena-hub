import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { matchesTable } from "./match";
import { usersTable } from "./user";

export const playersTable = pgTable("player", {
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "cascade",
  }),
  matchId: text("match_id").references(() => matchesTable.id, {
    onDelete: "cascade",
  }),
  score: integer("score").notNull().default(0),
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
}));
