import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { applyPaidCheckoutSession } from "@/lib/apply-paid-checkout-session";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";
import type Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { error: "Webhook não configurado (STRIPE_WEBHOOK_SECRET)" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const sess = event.data.object as Stripe.Checkout.Session;
    await applyPaidCheckoutSession(sess);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;
    const playerRowId = pi.metadata?.playerRowId;
    const matchId = pi.metadata?.matchId;

    if (!playerRowId || !matchId) {
      return NextResponse.json({ received: true });
    }

    const match = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.id, matchId),
      columns: { price: true },
    });

    if (!match?.price || pi.amount !== match.price) {
      return NextResponse.json({ received: true });
    }

    await db
      .update(playersTable)
      .set({
        confirmed: true,
        confirmedAt: new Date(),
        paymentStatus: "paid",
      })
      .where(
        and(
          eq(playersTable.id, playerRowId),
          eq(playersTable.paymentStatus, "pending"),
        ),
      );
  }

  if (event.type === "refund.updated") {
    const refund = event.data.object as Stripe.Refund;
    if (refund.status !== "succeeded") {
      return NextResponse.json({ received: true });
    }

    const piId =
      typeof refund.payment_intent === "string"
        ? refund.payment_intent
        : refund.payment_intent?.id;

    if (!piId) {
      return NextResponse.json({ received: true });
    }

    const pi = await stripe.paymentIntents.retrieve(piId);
    const playerRowId = pi.metadata?.playerRowId;

    if (!playerRowId) {
      return NextResponse.json({ received: true });
    }

    await db
      .update(playersTable)
      .set({
        paymentStatus: "refunded",
        stripePaymentIntentId: null,
        stripeCheckoutSessionId: null,
        confirmed: false,
      })
      .where(eq(playersTable.id, playerRowId));
  }

  return NextResponse.json({ received: true });
}
