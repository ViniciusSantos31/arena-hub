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
import { matchesTable } from "./match";
import { member } from "./member";
import { usersTable } from "./user";

// ── Enums ─────────────────────────────────────────────────────────────────

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending", // aguardando pagamento
  "paid", // confirmado pelo webhook
  "refunded", // reembolsado (partida cancelada)
  "failed", // pagamento recusado
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "credit_card",
  "debit_card",
]);

export const recipientStatusEnum = pgEnum("recipient_status", [
  "pending", // cadastro iniciado
  "active", // aprovado pelo Pagar.me (KYC ok)
  "blocked", // bloqueado
]);

// ── Tabela: payments ──────────────────────────────────────────────────────
// Uma linha por jogador por partida paga

export const paymentsTable = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Referências
  matchId: text("match_id")
    .notNull()
    .references(() => matchesTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  memberId: text("member_id").references(() => member.id),

  // Valores (em centavos — nunca ponto flutuante para dinheiro)
  grossAmountCents: integer("gross_amount_cents").notNull(),
  gatewayFeeCents: integer("gateway_fee_cents").notNull(),
  platformFeeCents: integer("platform_fee_cents").notNull(),
  organizerAmountCents: integer("organizer_amount_cents").notNull(),

  // Status e método
  status: paymentStatusEnum("status").notNull().default("pending"),
  method: paymentMethodEnum("method"),

  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeClientSecret: text("stripe_client_secret"), // enviado ao frontend para confirmar

  // Controle de escrow
  escrowReleasedAt: timestamp("escrow_released_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Tabela: payment_recipients ────────────────────────────────────────────
// Conta bancária do organizador cadastrada no Pagar.me

export const paymentRecipientsTable = pgTable("payment_recipients", {
  id: uuid("id").primaryKey().defaultRandom(),

  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),

  stripeAccountId: text("stripe_account_id").notNull(), // ID da conta Connect express

  status: recipientStatusEnum("status").notNull().default("pending"),

  // Dados bancários (apenas referência — dados sensíveis ficam no Pagar.me)
  bankName: text("bank_name"),
  accountLastDigits: text("account_last_digits"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Tabela: saved_payment_methods ─────────────────────────────────────────
// Cartões salvos por usuário para pagamentos futuros (partidas e mensalidades)

export const savedPaymentMethodsTable = pgTable("saved_payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(),
  brand: text("brand").notNull(),
  last4: text("last4").notNull(),
  expMonth: integer("exp_month").notNull(),
  expYear: integer("exp_year").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── Relations ─────────────────────────────────────────────────────────────

export const paymentsRelations = relations(paymentsTable, ({ one }) => ({
  match: one(matchesTable, {
    fields: [paymentsTable.matchId],
    references: [matchesTable.id],
  }),
  user: one(usersTable, {
    fields: [paymentsTable.userId],
    references: [usersTable.id],
  }),
  member: one(member, {
    fields: [paymentsTable.memberId],
    references: [member.id],
  }),
}));

export const paymentRecipientsRelations = relations(
  paymentRecipientsTable,
  ({ one }) => ({
    organization: one(organization, {
      fields: [paymentRecipientsTable.organizationId],
      references: [organization.id],
    }),
  }),
);

export const savedPaymentMethodsRelations = relations(
  savedPaymentMethodsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [savedPaymentMethodsTable.userId],
      references: [usersTable.id],
    }),
  }),
);
