"use server";

import { db } from "@/db";
import { paymentsTable } from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { calculateSplit, PAYMENT_CONFIG } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const createCharge = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
      organizationCode: z.string(),
      // Stripe só aceita card no Brasil por enquanto
      method: z.enum(["credit_card", "debit_card"]),
      // Método salvo opcional para 1-click pay
      savedPaymentMethodId: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, savedPaymentMethodId } = parsedInput;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const match = await db.query.matchesTable.findFirst({
      where: (m, { eq }) => eq(m.id, matchId),
    });

    if (!match?.isPaid || !match.totalPriceCents) {
      throw new Error("Partida não é paga");
    }
    if (match.status !== "open_registration") {
      throw new Error("Inscrições encerradas");
    }

    const pricePerPlayerCents = Math.ceil(
      match.totalPriceCents / match.maxPlayers,
    );

    if (pricePerPlayerCents < PAYMENT_CONFIG.MIN_PRICE_PER_PLAYER_CENTS) {
      throw new Error("Valor mínimo por jogador não atingido");
    }

    const existingPayment = await db.query.paymentsTable.findFirst({
      where: (p, { and, eq, inArray }) =>
        and(
          eq(p.matchId, matchId),
          eq(p.userId, session.user.id),
          inArray(p.status, ["pending", "paid"]),
        ),
    });
    if (existingPayment) throw new Error("Pagamento já existe");

    const recipient = await db.query.paymentRecipientsTable.findFirst({
      where: (r, { eq }) => eq(r.organizationId, match.organizationId!),
    });

    if (!recipient || recipient.status !== "active") {
      throw new Error("Organizador não configurou o recebimento");
    }

    // ── Garante Stripe Customer ────────────────────────────────────────────
    const userRecord = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, session.user.id),
    });

    let stripeCustomerId = userRecord?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name,
        metadata: { arenaHubUserId: session.user.id },
      });
      stripeCustomerId = customer.id;
      await db
        .update(usersTable)
        .set({ stripeCustomerId })
        .where(eq(usersTable.id, session.user.id));
    }

    const split = calculateSplit(pricePerPlayerCents);

    // ── Cria PaymentIntent com escrow + salvamento de método ──────────────
    const paymentIntentParams: Parameters<
      typeof stripe.paymentIntents.create
    >[0] = {
      amount: split.grossAmountCents,
      currency: "brl",
      capture_method: "manual",
      customer: stripeCustomerId,
      // Salva o método automaticamente para uso futuro
      setup_future_usage: "off_session",
      application_fee_amount: split.platformFeeCents,
      transfer_data: {
        destination: recipient.stripeAccountId,
      },
      metadata: {
        matchId,
        userId: session.user.id,
        arenaHubPaymentId: "pending",
      },
      description: `Arena Hub — ${match.title}`,
    };

    // Se há método salvo, confirma sem exigir ação do frontend
    if (savedPaymentMethodId) {
      paymentIntentParams.payment_method = savedPaymentMethodId;
      paymentIntentParams.confirm = true;
      paymentIntentParams.return_url = undefined;
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
    );

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        matchId,
        userId: session.user.id,
        grossAmountCents: split.grossAmountCents,
        gatewayFeeCents: split.gatewayFeeCents,
        platformFeeCents: split.platformFeeCents,
        organizerAmountCents: split.organizerAmountCents,
        status: "pending",
        method: parsedInput.method,
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
      })
      .returning();

    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { arenaHubPaymentId: payment.id },
    });

    await db
      .insert(playersTable)
      .values({
        matchId,
        userId: session.user.id,
        waitingQueue: false,
        paymentStatus: "pending",
      })
      .onConflictDoNothing();

    return {
      paymentId: payment.id,
      clientSecret: paymentIntent.client_secret,
      totalCents: split.grossAmountCents,
      stripeCustomerId,
      // Indica se o pagamento já foi confirmado (método salvo)
      alreadyConfirmed: savedPaymentMethodId
        ? paymentIntent.status === "requires_capture"
        : false,
    };
  });
