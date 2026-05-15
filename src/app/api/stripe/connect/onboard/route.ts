import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { requireAppUrl } from "@/lib/require-app-url";
import { getOrgIfUserCanManageStripe } from "@/lib/stripe-connect-access";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function createOnboardingAccountLink(
  organizationId: string,
  accountId: string,
) {
  const appUrl = requireAppUrl();
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/stripe/connect/onboard?organizationId=${encodeURIComponent(organizationId)}&accountId=${encodeURIComponent(accountId)}`,
    return_url: `${appUrl}/api/stripe/connect/callback?organizationId=${encodeURIComponent(organizationId)}&accountId=${encodeURIComponent(accountId)}`,
    type: "account_onboarding",
  });
}

/** Stripe chama ao expirar o link de onboarding — gera novo link para a mesma conta Express. */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");
  const accountId = searchParams.get("accountId");

  if (!organizationId || !accountId) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  const org = await getOrgIfUserCanManageStripe(
    session.user.id,
    organizationId,
  );
  if (!org) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  if (org.stripeAccountId !== accountId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const accountLink = await createOnboardingAccountLink(organizationId, accountId);
  return NextResponse.redirect(accountLink.url);
}

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

  try {
    requireAppUrl();
  } catch {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL não configurada no servidor" },
      { status: 500 },
    );
  }

  const org = await getOrgIfUserCanManageStripe(
    session.user.id,
    organizationId,
  );
  if (!org) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  let accountId = org.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "BR",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: {
        organizationId,
        userId: session.user.id,
      },
    });
    accountId = account.id;

    await db
      .update(organization)
      .set({ stripeAccountId: accountId })
      .where(eq(organization.id, organizationId));
  } else {
    const existing = await stripe.accounts.retrieve(accountId);
    if (
      existing.metadata?.organizationId &&
      existing.metadata.organizationId !== organizationId
    ) {
      return NextResponse.json(
        { error: "Conta Stripe inconsistente com este grupo" },
        { status: 409 },
      );
    }
    if (existing.charges_enabled && existing.details_submitted) {
      return NextResponse.json(
        {
          error:
            "Conta já ativa. Use «Gerenciar no Stripe» para abrir o painel Express.",
        },
        { status: 400 },
      );
    }
  }

  const accountLink = await createOnboardingAccountLink(
    organizationId,
    accountId,
  );

  return NextResponse.json({ url: accountLink.url, accountId });
}
