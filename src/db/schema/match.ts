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
import { organization } from "./auth";
import { playersTable } from "./player";

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "open_registration",
  "closed_registration",
  "team_sorted",
  "completed",
  "cancelled",
]);

export const matchesTable = pgTable("match", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  organizationId: text("organization_id").references(() => organization.id, {
    onDelete: "cascade",
  }),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  sport: text("sport").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  status: matchStatusEnum("status").notNull().default("open_registration"),
  minPlayers: integer("min_players").notNull(),
  maxPlayers: integer("max_players").notNull(),
  scheduledTo: timestamp("scheduled_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),

  // Payment
  isPaid: boolean("is_paid").notNull().default(false),

  // Valor TOTAL da partida em centavos (ex: R$200,00 = 20000)
  // O valor por jogador = totalPriceCents / maxPlayers
  totalPriceCents: integer("total_price_cents"),

  // Prazo para pagamento após inscrição (padrão: 30 minutos)
  paymentDeadlineMinutes: integer("payment_deadline_minutes").default(30),
});

export const matchesRelations = relations(matchesTable, ({ one, many }) => ({
  organization: one(organization, {
    fields: [matchesTable.organizationId],
    references: [organization.id],
  }),
  players: many(playersTable),
}));
