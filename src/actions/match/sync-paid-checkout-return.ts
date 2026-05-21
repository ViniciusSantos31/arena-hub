"use server";

import { db } from "@/db";
import { playersTable } from "@/db/schema/player";
import { applyPaidCheckoutSession } from "@/lib/apply-paid-checkout-session";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

const inputSchema = z.object({
  matchId: z.string(),
  sessionId: z.string(),
});

export type SyncPaidCheckoutReturnStatus =
  | "confirmed"
  | "already_confirmed"
  | "not_ready";

export const syncPaidCheckoutFromReturn = actionClient
  .inputSchema(inputSchema)
  .action(async ({ parsedInput }) => {
    const { matchId, sessionId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      checkoutSession.metadata?.matchId !== matchId ||
      checkoutSession.metadata?.userId !== session.user.id
    ) {
      throw new Error("Sessão de pagamento inválida para esta partida.");
    }

    const playerRowId = checkoutSession.metadata.playerRowId;
    if (!playerRowId) {
      throw new Error("Metadados da sessão incompletos.");
    }

    const outcome = await applyPaidCheckoutSession(checkoutSession);

    if (outcome === "updated") {
      return { status: "confirmed" as const };
    }

    const player = await db.query.playersTable.findFirst({
      where: eq(playersTable.id, playerRowId),
      columns: {
        paymentStatus: true,
        confirmed: true,
        userId: true,
      },
    });

    if (!player || player.userId !== session.user.id) {
      throw new Error("Jogador não encontrado.");
    }

    if (player.paymentStatus === "paid" && player.confirmed) {
      return { status: "already_confirmed" as const };
    }

    return { status: "not_ready" as const };
  });
