import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";

/**
 * Marca o jogador como pago e confirmado quando um Checkout Session está pago
 * e o valor bate com o da partida.
 */
export async function applyPaidCheckoutSession(
  sess: Stripe.Checkout.Session,
): Promise<"updated" | "noop"> {
  if (sess.payment_status !== "paid") {
    return "noop";
  }

  const playerRowId = sess.metadata?.playerRowId;
  const matchId = sess.metadata?.matchId;

  if (!playerRowId || !matchId || sess.amount_total == null) {
    return "noop";
  }

  const match = await db.query.matchesTable.findFirst({
    where: eq(matchesTable.id, matchId),
    columns: { price: true },
  });

  if (!match?.price || sess.amount_total !== match.price) {
    return "noop";
  }

  const paymentIntentId =
    typeof sess.payment_intent === "string"
      ? sess.payment_intent
      : sess.payment_intent?.id;

  const updated = await db
    .update(playersTable)
    .set({
      confirmed: true,
      confirmedAt: new Date(),
      paymentStatus: "paid",
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: paymentIntentId ?? null,
    })
    .where(
      and(
        eq(playersTable.id, playerRowId),
        eq(playersTable.paymentStatus, "pending"),
      ),
    )
    .returning({ id: playersTable.id });

  return updated.length > 0 ? "updated" : "noop";
}
