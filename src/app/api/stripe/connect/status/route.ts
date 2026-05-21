import { auth } from "@/lib/auth";
import { getOrgIfUserCanManageStripe } from "@/lib/stripe-connect-access";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");
  const accountId = searchParams.get("accountId");

  if (!organizationId || !accountId) {
    return NextResponse.json(
      { error: "organizationId e accountId são obrigatórios" },
      { status: 400 },
    );
  }

  const org = await getOrgIfUserCanManageStripe(
    session.user.id,
    organizationId,
  );
  if (!org || org.stripeAccountId !== accountId) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  if (!org.paidMatchesFeatureEnabled) {
    return NextResponse.json(
      {
        error:
          "Pagamentos não estão habilitados para este grupo pela plataforma.",
      },
      { status: 403 },
    );
  }

  const account = await stripe.accounts.retrieve(accountId);

  return NextResponse.json({
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  });
}
