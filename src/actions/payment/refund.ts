"use server";

import { db } from "@/db";
import { stripe } from "@/lib/stripe";

// Chamado internamente quando status da partida → "cancelled"
// Cancela os PaymentIntents ainda em escrow (não capturados)
export async function refundMatchPayments(matchId: string) {
  const payments = await db.query.paymentsTable.findMany({
    where: (p, { and, eq }) =>
      and(eq(p.matchId, matchId), eq(p.status, "paid")),
  });

  await Promise.all(
    payments.map(async (payment) => {
      if (!payment.stripePaymentIntentId) return;

      // Se ainda não foi capturado (escrow), cancela — reembolso automático
      // Se já foi capturado, usa refund
      const pi = await stripe.paymentIntents.retrieve(
        payment.stripePaymentIntentId,
      );

      if (pi.status === "requires_capture") {
        await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
      } else if (pi.status === "succeeded") {
        await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: "requested_by_customer",
        });
      }
    }),
  );
}
