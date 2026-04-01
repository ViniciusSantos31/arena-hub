// Constantes financeiras — altere aqui para ajustar o modelo
export const PAYMENT_CONFIG = {
  // Comissão da plataforma sobre o valor líquido por partida (após taxa do gateway)
  PLATFORM_FEE_RATE: 0.03, // 3%

  // Comissão da plataforma sobre mensalidades (application_fee_percent no Stripe)
  PLATFORM_SUBSCRIPTION_FEE_PERCENT: 3, // 3%

  // Taxa estimada do Stripe (usada para cálculo de preview ao organizador)
  GATEWAY_FEE_RATE: 0.039, // 3,9%
  GATEWAY_FEE_FIXED: 0.39, // R$0,39 por transação

  // Valor mínimo por jogador em centavos (R$5,00)
  MIN_PRICE_PER_PLAYER_CENTS: 500,

  // Valor máximo por jogador em centavos (R$500,00)
  MAX_PRICE_PER_PLAYER_CENTS: 50000,

  // Valor mínimo de mensalidade em centavos (R$10,00)
  MIN_SUBSCRIPTION_CENTS: 1000,

  // Valor máximo de mensalidade em centavos (R$500,00)
  MAX_SUBSCRIPTION_CENTS: 50000,

  // Moeda
  CURRENCY: "BRL",
} as const;

/**
 * Calcula a divisão financeira de uma transação.
 * Todos os valores em centavos para evitar erros de ponto flutuante.
 *
 * Exemplo: R$20,00 por jogador
 *   grossAmountCents = 2000 (R$20,00)
 *
 *   gatewayFee       = 50 + 9 = 59  (\~R$0,59)
 *
 *   netAmount        = 2000 - 59 = 1941 (\~R$19,41)
 *
 *   platformFee      = floor(1941 * 0.08) = 155  (\~R$1,55)
 *
 *   organizerAmount  = 1941 - 155 = 1786  (\~R$17,86)
 */
export function calculateSplit(grossAmountCents: number) {
  const gatewayFee = Math.ceil(
    grossAmountCents * PAYMENT_CONFIG.GATEWAY_FEE_RATE +
      PAYMENT_CONFIG.GATEWAY_FEE_FIXED * 100,
  );
  const netAmount = grossAmountCents - gatewayFee;
  const platformFee = Math.floor(netAmount * PAYMENT_CONFIG.PLATFORM_FEE_RATE);
  const organizerAmount = netAmount - platformFee;

  return {
    grossAmountCents,
    gatewayFeeCents: gatewayFee,
    netAmountCents: netAmount,
    platformFeeCents: platformFee,
    organizerAmountCents: organizerAmount,
  };
}

/** Converte centavos para reais formatado (ex: 2000 → "R$ 20,00") */
export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Calcula o valor por jogador dado o total e o número de vagas */
export function calcPricePerPlayer(
  totalCents: number,
  maxPlayers: number,
): number {
  return Math.ceil(totalCents / maxPlayers);
}
