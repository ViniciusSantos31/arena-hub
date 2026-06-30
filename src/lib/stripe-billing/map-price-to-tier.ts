import type { PlanTier } from "@/lib/user-plan/types";

function getPriceEnvMap(): Record<string, PlanTier> {
  return {
    [process.env.STRIPE_PRICE_BASIC!]: "basic",
    [process.env.STRIPE_PRICE_INTERMEDIATE!]: "intermediate",
    [process.env.STRIPE_PRICE_PREMIUM!]: "premium",
  };
}

export function priceIdToPlanTier(priceId: string): PlanTier | null {
  return getPriceEnvMap()[priceId] ?? null;
}

export function planTierToPriceId(tier: PlanTier): string {
  const map: Record<PlanTier, string | undefined> = {
    basic: process.env.STRIPE_PRICE_BASIC,
    intermediate: process.env.STRIPE_PRICE_INTERMEDIATE,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  };

  const priceId = map[tier];
  if (!priceId) {
    throw new Error(`Price ID não configurado para o plano ${tier}.`);
  }

  return priceId;
}
