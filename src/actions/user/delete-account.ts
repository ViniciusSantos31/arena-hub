"use server";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { deleteUserAccount } from "@/lib/user-account/delete-user-account";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export const deleteAccount = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  await deleteUserAccount(session.user.id);

  revalidatePath("/", "layout");
  revalidatePath("/group", "layout");
  revalidatePath("/home");

  return { success: true };
});
