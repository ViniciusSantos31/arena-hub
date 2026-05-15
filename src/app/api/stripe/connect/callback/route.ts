import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

  const account = await stripe.accounts.retrieve(accountId);

  if (account.details_submitted) {
    await db
      .update(organization)
      .set({ stripeAccountId: accountId })
      .where(eq(organization.id, organizationId));
  }

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    columns: { code: true },
  });

  const redirectPath = org?.code
    ? `/group/${org.code}/settings#payments`
    : "/home";

  return NextResponse.redirect(new URL(redirectPath, req.url));
}
