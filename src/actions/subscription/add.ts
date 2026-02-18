"use server";

// actions/push-subscriptions.ts
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema/subscription";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Salva ou atualiza o FCM token do usuário
export async function savePushSubscription(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Não autorizado");

  if (!token || token.trim() === "") {
    console.error("[Push] Tentativa de salvar token vazio");
    throw new Error("Token inválido");
  }

  console.log("[Push] Salvando token FCM:", {
    userId: session.user.id,
    tokenPrefix: token.substring(0, 20) + "...",
  });

  await db
    .insert(pushSubscriptions)
    .values({
      userId: session.user.id,
      token: token,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.token,
      set: {
        updatedAt: new Date(),
      },
    });

  console.log("[Push] Token salvo com sucesso");
}
