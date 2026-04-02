"use server";

import { db } from "@/db";
import { accountsTable } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const getLinkedAccounts = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const accounts = await db
    .select({
      id: accountsTable.id,
      providerId: accountsTable.providerId,
      createdAt: accountsTable.createdAt,
    })
    .from(accountsTable)
    .where(eq(accountsTable.userId, session.user.id));

  return accounts;
});
