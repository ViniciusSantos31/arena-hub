import Stripe from "stripe";

// Instância singleton — padrão Next.js para evitar múltiplas instâncias em dev
const globalForStripe = globalThis as unknown as { stripe: Stripe };

export const stripe =
  globalForStripe.stripe ??
  new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
    typescript: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForStripe.stripe = stripe;
}
