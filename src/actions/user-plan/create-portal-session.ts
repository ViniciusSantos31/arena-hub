"use server";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { createBillingPortalSession as createBillingPortalSessionLib } from "@/lib/stripe-billing/create-billing-portal-session";
import { headers } from "next/headers";

export const createBillingPortalSession = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  return createBillingPortalSessionLib(session.user.id);
});
