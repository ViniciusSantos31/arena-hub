/** Cobrança visível e ativa só se a partida for paga e o grupo tiver o recurso liberado no admin. */
export function isPaidMatchActiveForGroup(
  matchIsPaid: boolean,
  groupPaidFeatureEnabled: boolean,
) {
  return matchIsPaid && groupPaidFeatureEnabled;
}
