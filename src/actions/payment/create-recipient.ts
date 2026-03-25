"use server";

import { db } from "@/db";
import { paymentRecipientsTable } from "@/db/schema/payment";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import z from "zod/v4";

export const createRecipient = actionClient
  .inputSchema(z.object({ organizationId: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    // Cria conta Express no Stripe Connect
    // No sandbox, isso não exige documentos — perfeito para testar
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
        organizationId: parsedInput.organizationId,
        userId: session.user.id,
      },
    });

    // Gera link de onboarding — organizador preenche dados bancários no Stripe
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/group/${parsedInput.organizationId}/settings/billing?refresh=1`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/group/${parsedInput.organizationId}/settings/billing?success=1`,
      type: "account_onboarding",
    });

    // Salva no banco com status pending — muda para active via webhook
    await db
      .insert(paymentRecipientsTable)
      .values({
        organizationId: parsedInput.organizationId,
        userId: session.user.id,
        stripeAccountId: account.id,
        status: "pending",
      })
      .onConflictDoUpdate({
        target: paymentRecipientsTable.organizationId,
        set: { stripeAccountId: account.id, status: "pending" },
      });

    // Retorna a URL para redirecionar o organizador ao onboarding do Stripe
    return { onboardingUrl: accountLink.url };
  });
