"use server";

import { db } from "@/db";
import { paymentsTable } from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { calculateSplit, PAYMENT_CONFIG } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import z from "zod/v4";

export const createCharge = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
      organizationCode: z.string(),
      // Stripe só aceita card no Brasil por enquanto
      method: z.enum(["credit_card", "debit_card"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

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

    const split = calculateSplit(pricePerPlayerCents);

    // Stripe Connect: capture_method "manual" = escrow
    // O dinheiro fica autorizado mas não capturado até chamarmos .capture()
    // application_fee_amount = comissão da Arena Hub (em centavos)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: split.grossAmountCents,
      currency: "brl",
      capture_method: "manual", // ← escrow
      application_fee_amount: split.platformFeeCents,
      transfer_data: {
        destination: recipient.stripeAccountId,
      },
      metadata: {
        matchId,
        userId: session.user.id,
        arenaHubPaymentId: "pending", // atualizado após insert
      },
      description: `Arena Hub — ${match.title}`,
    });

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

    // Atualiza metadata com o ID real do pagamento
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { arenaHubPaymentId: payment.id },
    });

    // Insere jogador com pagamento pendente — confirmação vem via webhook
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
      // client_secret é enviado ao browser para o Stripe.js confirmar o cartão
      clientSecret: paymentIntent.client_secret,
      totalCents: split.grossAmountCents,
    };
  });
