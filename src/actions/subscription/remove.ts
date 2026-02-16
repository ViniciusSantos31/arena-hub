import { db } from "@/db";
import { pushSubscriptionsTable } from "@/db/schema/subscription";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Remove a subscription (usuário desativou notificações)
export async function removePushSubscription(endpoint: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Não autorizado");

  await db
    .delete(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.endpoint, endpoint));
}
