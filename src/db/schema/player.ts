import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { matchesTable } from "./match";
import { member } from "./member";
import { usersTable } from "./user";

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
