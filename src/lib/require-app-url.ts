/**
 * URL pública da aplicação (sem barra final). Usada em redirects do Stripe Checkout e Connect.
 */
export function requireAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL não está configurada (necessária para o Stripe).",
    );
  }
  return url.replace(/\/$/, "");
}
