"use server";

import { db } from "@/db";
import { playersTable } from "@/db/schema/player";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
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

    const player = await db
      .select()
      .from(playersTable)
      .where(
        and(
          eq(playersTable.userId, playerId),
          eq(playersTable.matchId, matchId),
        ),
      )
      .limit(1)
      .then((res) => res[0]);

    if (!player) {
      throw new Error("Jogador não encontrado na partida.");
    }

    if (banFromMatch) {
      await db
        .update(playersTable)
        .set({
          removedByModerator: true,
          removalReason: reason,
          bannedFromMatch: true,
        })
        .where(eq(playersTable.id, player.id));
    } else {
      await db.delete(playersTable).where(eq(playersTable.id, player.id));
    }

    return { playerId, matchId, banned: banFromMatch };
  });
