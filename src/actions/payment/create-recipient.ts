"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { paymentRecipientsTable } from "@/db/schema/payment";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

import "dotenv/config";

export const createRecipient = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });

    if (!org) throw new Error("Grupo não encontrado");

    const account = await stripe.accounts.create({
      type: "express",
      country: "BR",
      email: session.user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: {
        organizationId: org.id,
        userId: session.user.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/group/${parsedInput.organizationCode}/settings/billing?refresh=1`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/group/${parsedInput.organizationCode}/settings/billing?success=1`,
      type: "account_onboarding",
    });

    await db
      .insert(paymentRecipientsTable)
      .values({
        organizationId: org.id,
        userId: session.user.id,
        stripeAccountId: account.id,
        status: "pending",
      })
      .onConflictDoNothing();

    return { onboardingUrl: accountLink.url };
  });
