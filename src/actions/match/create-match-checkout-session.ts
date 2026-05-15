"use server";

import { db } from "@/db";
import { organization as organizationTable } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { requireAppUrl } from "@/lib/require-app-url";
import { getUserMembership } from "../group/membership";

const PLATFORM_FEE_RATE = 0.02;

export const createMatchCheckoutSession = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { matchId, organizationCode } = parsedInput;
    const baseUrl = requireAppUrl();

    const membership = await getUserMembership({ organizationCode });
    if (!membership.data) {
      throw new Error("Você não é membro deste grupo");
    }

    const match = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.id, matchId),
      columns: {
        id: true,
        title: true,
        organizationId: true,
        isPaid: true,
        price: true,
        status: true,
      },
    });

    if (!match?.organizationId || !match.isPaid || !match.price) {
      throw new Error("Esta partida não exige pagamento.");
    }

    if (match.status !== "open_registration") {
      throw new Error(
        "O pagamento só está disponível durante as inscrições abertas.",
      );
    }

    const org = await db.query.organization.findFirst({
      where: eq(organizationTable.id, match.organizationId),
      columns: { stripeAccountId: true },
    });

    if (!org?.stripeAccountId) {
      throw new Error("O grupo não está configurado para receber pagamentos.");
    }

    const account = await stripe.accounts.retrieve(org.stripeAccountId);
    if (!account.charges_enabled) {
      throw new Error(
        "A conta Stripe do grupo ainda não está pronta para receber pagamentos.",
      );
    }

    const player = await db.query.playersTable.findFirst({
      where: and(
        eq(playersTable.matchId, matchId),
        eq(playersTable.userId, session.user.id),
      ),
    });

    if (!player) {
      throw new Error("Participe da partida antes de pagar.");
    }

    if (player.paymentStatus === "exempt") {
      throw new Error("Você está isento desta cobrança.");
    }

    if (player.paymentStatus === "paid" && player.confirmed) {
      throw new Error("Pagamento já confirmado.");
    }

    if (player.paymentStatus !== "pending") {
      throw new Error("Não é possível gerar um novo link neste estado.");
    }

    const applicationFeeAmount = Math.max(
      1,
      Math.round(match.price * PLATFORM_FEE_RATE),
    );

    const meta = {
      playerRowId: player.id,
      matchId: match.id,
      userId: session.user.id,
    };

    if (player.stripeCheckoutSessionId) {
      await stripe.checkout.sessions
        .expire(player.stripeCheckoutSessionId)
        .catch(() => undefined);
    }

    if (player.stripePaymentIntentId) {
      await stripe.paymentIntents
        .cancel(player.stripePaymentIntentId)
        .catch(() => undefined);
    }

    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        locale: "pt-BR",
        line_items: [
          {
            price_data: {
              currency: "brl",
              unit_amount: match.price,
              product_data: {
                name: `Inscrição: ${match.title}`,
                description: "Pagamento único — após concluir, o link deixa de ser válido.",
              },
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          transfer_data: {
            destination: org.stripeAccountId,
          },
          metadata: meta,
        },
        metadata: meta,
        success_url: `${baseUrl}/group/${organizationCode}/matches/${matchId}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/group/${organizationCode}/matches/${matchId}?checkout=cancel`,
      },
      {
        idempotencyKey: `${player.id}-checkout-${Date.now()}`,
      },
    );

    const url = checkoutSession.url;
    if (!url) {
      throw new Error("Não foi possível gerar o link de pagamento.");
    }

    await db
      .update(playersTable)
      .set({
        stripeCheckoutSessionId: checkoutSession.id,
        stripePaymentIntentId: null,
      })
      .where(eq(playersTable.id, player.id));

    return {
      checkoutUrl: url,
      checkoutSessionId: checkoutSession.id,
      expiresAt: checkoutSession.expires_at
        ? new Date(checkoutSession.expires_at * 1000).toISOString()
        : null,
    };
  });
