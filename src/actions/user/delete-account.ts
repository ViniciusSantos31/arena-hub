"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const deleteAccount = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.user.id;

  // Revoga todas as sessões ativas antes de excluir
  await auth.api.revokeOtherSessions({
    headers: await headers(),
  });

  const deleted = await db
    .delete(usersTable)
    .where(eq(usersTable.id, userId))
    .returning({ id: usersTable.id });

  if (!deleted[0]) {
    throw new Error("Falha ao excluir conta");
  }

  return { success: true };
});
