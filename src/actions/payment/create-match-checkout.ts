"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { paymentRecipientsTable } from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { calculateSplit, PAYMENT_CONFIG } from "@/lib/payments";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export const createMatchCheckout = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, organizationCode } = parsedInput;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const match = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.id, matchId),
    });

    if (!match?.isPaid || !match.totalPriceCents) {
      throw new Error("Partida não é paga");
    }
    if (match.status !== "open_registration") {
      throw new Error("Inscrições encerradas");
    }

    // Jogador já na partida → impede duplicidade
    const existingPlayer = await db.query.playersTable.findFirst({
      where: and(
        eq(playersTable.matchId, matchId),
        eq(playersTable.userId, session.user.id),
      ),
    });
    if (existingPlayer) throw new Error("Você já está inscrito nesta partida");

    const pricePerPlayerCents = Math.ceil(
      match.totalPriceCents / match.maxPlayers,
    );

    if (pricePerPlayerCents < PAYMENT_CONFIG.MIN_PRICE_PER_PLAYER_CENTS) {
      throw new Error("Valor mínimo por jogador não atingido");
    }

    const recipient = await db.query.paymentRecipientsTable.findFirst({
      where: and(
        eq(paymentRecipientsTable.organizationId, match.organizationId!),
        eq(paymentRecipientsTable.status, "active"),
      ),
    });
    if (!recipient) throw new Error("Organizador não configurou o recebimento");

    // Garante Stripe Customer
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

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Inscrição — ${match.title}`,
              description: `Partida: ${match.title}`,
            },
            unit_amount: split.grossAmountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: "manual",
        application_fee_amount: split.platformFeeCents,
        transfer_data: { destination: recipient.stripeAccountId },
        metadata: {
          matchId,
          userId: session.user.id,
          organizationCode,
          type: "match_payment",
        },
      },
      success_url: `${APP_URL}/group/${organizationCode}/matches/${matchId}?payment=success`,
      cancel_url: `${APP_URL}/group/${organizationCode}/matches/${matchId}`,
      locale: "pt-BR",
      metadata: {
        matchId,
        userId: session.user.id,
        organizationCode,
        type: "match_payment",
      },
    });

    return { url: checkoutSession.url };
  });
