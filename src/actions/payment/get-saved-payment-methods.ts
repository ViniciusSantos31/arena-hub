"use server";

import { db } from "@/db";
import { savedPaymentMethodsTable } from "@/db/schema/payment";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

export const getSavedPaymentMethods = actionClient.action(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autenticado");

  const methods = await db.query.savedPaymentMethodsTable.findMany({
    where: eq(savedPaymentMethodsTable.userId, session.user.id),
    orderBy: [desc(savedPaymentMethodsTable.isDefault), desc(savedPaymentMethodsTable.createdAt)],
  });

  return methods;
});
