import { db } from "@/db";
import { playersTable } from "@/db/schema/player";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export type MatchCancelStripeResult = {
  refundedCount: number;
  pendingSessionsCleared: number;
  skippedPaidWithoutPi: number;
  refundFailures: string[];
};

/**
 * Ao cancelar partida paga: expira Checkouts pendentes e estorna PaymentIntents já pagos (Connect).
 */
export async function settleStripeOnMatchCancel(
  matchId: string,
): Promise<MatchCancelStripeResult> {
  const result: MatchCancelStripeResult = {
    refundedCount: 0,
    pendingSessionsCleared: 0,
    skippedPaidWithoutPi: 0,
    refundFailures: [],
  };

  const players = await db.query.playersTable.findMany({
    where: eq(playersTable.matchId, matchId),
  });

  for (const p of players) {
    if (p.paymentStatus === "exempt") continue;

    if (p.paymentStatus === "pending") {
      if (p.stripeCheckoutSessionId) {
        await stripe.checkout.sessions
          .expire(p.stripeCheckoutSessionId)
          .catch(() => undefined);
        result.pendingSessionsCleared += 1;
      }
      if (p.stripePaymentIntentId) {
        await stripe.paymentIntents
          .cancel(p.stripePaymentIntentId)
          .catch(() => undefined);
      }
      await db
        .update(playersTable)
        .set({
          stripeCheckoutSessionId: null,
          stripePaymentIntentId: null,
        })
        .where(eq(playersTable.id, p.id));
      continue;
    }

    if (p.paymentStatus === "paid") {
      if (!p.stripePaymentIntentId) {
        result.skippedPaidWithoutPi += 1;
        console.warn(
          `[stripe] Partida ${matchId}: jogador ${p.id} pago sem PaymentIntent — verificar no Stripe.`,
        );
        continue;
      }

      try {
        await stripe.refunds.create(
          {
            payment_intent: p.stripePaymentIntentId,
            reverse_transfer: true,
            refund_application_fee: true,
          },
          {
            idempotencyKey: `cancel-match-${matchId}-player-${p.id}-refund`,
          },
        );

        await db
          .update(playersTable)
          .set({
            paymentStatus: "refunded",
            stripePaymentIntentId: null,
            stripeCheckoutSessionId: null,
            confirmed: false,
          })
          .where(eq(playersTable.id, p.id));

        result.refundedCount += 1;
      } catch (e) {
        const msg =
          e instanceof Stripe.errors.StripeError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Erro desconhecido";
        result.refundFailures.push(`Jogador ${p.id}: ${msg}`);
      }
    }
  }

  return result;
}
