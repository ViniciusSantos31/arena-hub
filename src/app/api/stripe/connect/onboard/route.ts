import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { organizationId } = await req.json();

  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId é obrigatório" },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const account = await stripe.accounts.create({
    type: "express",
    country: "BR",
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      organizationId,
      userId: session.user.id,
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${appUrl}/api/stripe/connect/onboard?organizationId=${organizationId}&accountId=${account.id}`,
    return_url: `${appUrl}/api/stripe/connect/callback?organizationId=${organizationId}&accountId=${account.id}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url, accountId: account.id });
}
