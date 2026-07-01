export function stripeSubscriptionDashboardUrl(
  stripeSubscriptionId: string,
): string {
  return `https://dashboard.stripe.com/subscriptions/${stripeSubscriptionId}`;
}

export function stripeCustomerDashboardUrl(stripeCustomerId: string): string {
  return `https://dashboard.stripe.com/customers/${stripeCustomerId}`;
}
