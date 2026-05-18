"use server";

import { db } from "@/db";
import { playersTable } from "@/db/schema/player";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { settleStripePaymentBeforeModeratorRemoval } from "@/lib/stripe-player-removal";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";
import { getUserMembership } from "../group/membership";

export const removePlayerFromMatch = actionClient
  .inputSchema(
    z.object({
      playerId: z.string().min(1),
      matchId: z.string().min(1),
      organizationCode: z.string().min(1),
      reason: z.string().min(1, "O motivo é obrigatório."),
      banFromMatch: z.boolean().default(false),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { playerId, matchId, organizationCode, reason, banFromMatch } =
      parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado.");
    }

    const membership = await getUserMembership({ organizationCode }).then(
      (res) => res.data,
    );

    if (!membership) {
      throw new Error("Usuário não é membro da organização.");
    }

    const canRemove = can(membership, ["match:update"]);

    if (!canRemove) {
      throw new Error("Você não tem permissão para remover jogadores.");
    }

    const organizationId = await getOrgIdByCode({ code: organizationCode }).then(
      (r) => r.data,
    );

    if (!organizationId) {
      throw new Error("Organização não encontrada.");
    }

    const row = await db.query.playersTable.findFirst({
      where: and(
        eq(playersTable.userId, playerId),
        eq(playersTable.matchId, matchId),
      ),
      columns: {
        id: true,
        paymentStatus: true,
        stripeCheckoutSessionId: true,
        stripePaymentIntentId: true,
      },
      with: {
        match: {
          columns: { organizationId: true, isPaid: true },
        },
      },
    });

    if (!row?.match || row.match.organizationId !== organizationId) {
      throw new Error("Jogador não encontrado na partida.");
    }

    const matchIsPaid = row.match.isPaid === true;

    if (matchIsPaid) {
      await settleStripePaymentBeforeModeratorRemoval({
        matchIsPaid: true,
        paymentStatus: row.paymentStatus,
        stripeCheckoutSessionId: row.stripeCheckoutSessionId,
        stripePaymentIntentId: row.stripePaymentIntentId,
        playerRowId: row.id,
        matchId,
      });
    }

    if (banFromMatch) {
      const updates: Partial<typeof playersTable.$inferInsert> = {
        removedByModerator: true,
        removalReason: reason,
        bannedFromMatch: true,
      };

      if (matchIsPaid) {
        if (row.paymentStatus === "paid") {
          updates.paymentStatus = "refunded";
          updates.stripePaymentIntentId = null;
          updates.stripeCheckoutSessionId = null;
          updates.confirmed = false;
        } else if (row.paymentStatus === "pending") {
          updates.stripePaymentIntentId = null;
          updates.stripeCheckoutSessionId = null;
        }
      }

      await db
        .update(playersTable)
        .set(updates)
        .where(eq(playersTable.id, row.id));
    } else {
      await db.delete(playersTable).where(eq(playersTable.id, row.id));
    }

    return { playerId, matchId, banned: banFromMatch };
  });
