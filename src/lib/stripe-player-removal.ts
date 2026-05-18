import { stripe } from "@/lib/stripe";

/**
 * Antes de remover/banir jogador de partida paga: encerra checkout pendente ou estorna pagamento concluído.
 */
export async function settleStripePaymentBeforeModeratorRemoval(opts: {
  matchIsPaid: boolean;
  paymentStatus: "pending" | "paid" | "refunded" | "exempt";
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  playerRowId: string;
  matchId: string;
}): Promise<void> {
  if (!opts.matchIsPaid) return;

  if (opts.paymentStatus === "exempt" || opts.paymentStatus === "refunded") {
    return;
  }

  if (opts.paymentStatus === "pending") {
    if (opts.stripeCheckoutSessionId) {
      await stripe.checkout.sessions
        .expire(opts.stripeCheckoutSessionId)
        .catch(() => undefined);
    }
    if (opts.stripePaymentIntentId) {
      await stripe.paymentIntents
        .cancel(opts.stripePaymentIntentId)
        .catch(() => undefined);
    }
    return;
  }

  if (opts.paymentStatus === "paid") {
    if (!opts.stripePaymentIntentId) {
      throw new Error(
        "Inscrição paga sem PaymentIntent registrado. Estorne manualmente no Stripe ou sincronize o pagamento antes de remover o jogador.",
      );
    }

    await stripe.refunds.create(
      {
        payment_intent: opts.stripePaymentIntentId,
        reverse_transfer: true,
        refund_application_fee: true,
      },
      {
        idempotencyKey: `mod-remove-${opts.matchId}-${opts.playerRowId}-refund`,
      },
    );
  }
}
