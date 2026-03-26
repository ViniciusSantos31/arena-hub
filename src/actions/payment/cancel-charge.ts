"use server";

import { db } from "@/db";
import { paymentsTable } from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const cancelCharge = actionClient
  .inputSchema(z.object({ matchId: z.string() }))
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const userId = session.user.id;

    const payment = await db.query.paymentsTable.findFirst({
      where: (p, { and, eq, inArray }) =>
        and(
          eq(p.matchId, matchId),
          eq(p.userId, userId),
          inArray(p.status, ["pending", "paid"]),
        ),
    });

    if (payment?.stripePaymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(
        payment.stripePaymentIntentId,
      );

      if (
        pi.status === "requires_payment_method" ||
        pi.status === "requires_confirmation" ||
        pi.status === "requires_action" ||
        pi.status === "processing"
      ) {
        await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
      } else if (pi.status === "requires_capture") {
        // Valor em escrow — estorna antes de remover
        await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);
      } else if (pi.status === "succeeded") {
        await stripe.refunds.create({
          payment_intent: payment.stripePaymentIntentId,
          reason: "requested_by_customer",
        });
      }

      await db
        .update(paymentsTable)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));
    }

    await db
      .delete(playersTable)
      .where(
        and(
          eq(playersTable.matchId, matchId),
          eq(playersTable.userId, userId),
        ),
      );
  });
