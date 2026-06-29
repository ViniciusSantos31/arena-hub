"use server";

import { getSubscriptionSummaryForUser } from "@/lib/user-plan/subscription-summary";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";

export type { SubscriptionSummary } from "@/lib/user-plan/subscription-summary";

export const getSubscriptionSummary = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  return getSubscriptionSummaryForUser(session.user.id);
});
