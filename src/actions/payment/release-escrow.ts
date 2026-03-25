"use server";

import { db } from "@/db";
import { paymentsTable } from "@/db/schema/payment";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";

// Chamado internamente quando status da partida → "completed"
// Captura os PaymentIntents autorizados, liberando o escrow para o organizador
export async function releaseMatchEscrow(matchId: string) {
  const payments = await db.query.paymentsTable.findMany({
    where: (p, { and, eq }) =>
      and(eq(p.matchId, matchId), eq(p.status, "paid")),
  });

  await Promise.all(
    payments.map(async (payment) => {
      if (!payment.stripePaymentIntentId) return;

      // .capture() = libera o dinheiro retido para o organizador
      await stripe.paymentIntents.capture(payment.stripePaymentIntentId);

      await db
        .update(paymentsTable)
        .set({ escrowReleasedAt: new Date(), updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));
    }),
  );
}
