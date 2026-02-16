"use server";

// actions/push-subscriptions.ts
import { db } from "@/db";
import { pushSubscriptionsTable } from "@/db/schema/subscription";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Salva ou atualiza a subscription do usuário
export async function savePushSubscription(subscription: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Não autorizado");

  await db
    .insert(pushSubscriptionsTable)
    .values({
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptionsTable.endpoint,
      set: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        updatedAt: new Date(),
      },
    });
}
