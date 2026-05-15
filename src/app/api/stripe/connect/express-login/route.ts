import { auth } from "@/lib/auth";
import { getOrgIfUserCanManageStripe } from "@/lib/stripe-connect-access";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Link mágico para o painel Stripe Express (contas conectadas), sem URL genérica do dashboard.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = (await req.json()) as { organizationId?: string };
  const organizationId = body.organizationId;

  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId é obrigatório" },
      { status: 400 },
    );
  }

  const org = await getOrgIfUserCanManageStripe(
    session.user.id,
    organizationId,
  );
  if (!org) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  if (!org.stripeAccountId) {
    return NextResponse.json(
      { error: "Nenhuma conta Stripe conectada a este grupo" },
      { status: 400 },
    );
  }

  const loginLink = await stripe.accounts.createLoginLink(org.stripeAccountId);

  return NextResponse.json({ url: loginLink.url });
}
