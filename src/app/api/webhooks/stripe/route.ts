import { db } from "@/db";
import { paymentsTable } from "@/db/schema/payment";
import { playersTable } from "@/db/schema/player";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event;
  try {
    // Stripe valida a assinatura automaticamente — dispara erro se inválida
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  switch (event.type) {
    case "payment_intent.amount_capturable_updated": {
      // Cartão autorizado — jogador confirmado na partida
      const pi = event.data.object;
      const payment = await db.query.paymentsTable.findFirst({
        where: (p, { eq }) => eq(p.stripePaymentIntentId, pi.id),
      });
      if (!payment) break;

      await db
        .update(paymentsTable)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      await db
        .update(playersTable)
        .set({ paymentStatus: "paid", confirmed: true })
        .where(eq(playersTable.userId, payment.userId));

      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const payment = await db.query.paymentsTable.findFirst({
        where: (p, { eq }) => eq(p.stripePaymentIntentId, pi.id),
      });
      if (!payment) break;

      await db
        .update(paymentsTable)
        .set({ status: "failed", updatedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

      await db
        .delete(playersTable)
        .where(eq(playersTable.userId, payment.userId));

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      await db
        .update(paymentsTable)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(
          eq(
            paymentsTable.stripePaymentIntentId,
            charge.payment_intent as string,
          ),
        );
      break;
    }
  }

  return NextResponse.json({ received: true });
}
