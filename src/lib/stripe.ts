import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY não está definida.");
}

if (
  process.env.NODE_ENV === "production" &&
  secretKey.startsWith("sk_test_")
) {
  console.warn(
    "[stripe] Produção com chave de teste (sk_test_). Para cobranças reais, use chave live (sk_live_…) e webhook/endpoint no modo live do Dashboard.",
  );
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2026-04-22.dahlia",
});
