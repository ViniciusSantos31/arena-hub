import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizationsTable } from "./auth";
import { playersTable } from "./player";

export const matchesTable = pgTable("match", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  organizationId: text("organization_id").references(
    () => organizationsTable.id,
    {
      onDelete: "cascade",
    },
  ),
  private: boolean("private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const matchesRelations = relations(matchesTable, ({ one, many }) => ({
  organization: one(organizationsTable, {
    fields: [matchesTable.organizationId],
    references: [organizationsTable.id],
  }),
  players: many(playersTable),
}));
