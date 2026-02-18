"use server";

import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema/subscription";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Remove a subscription (usuário desativou notificações)
export async function removePushSubscription(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Não autorizado");

  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.token, token));
}
