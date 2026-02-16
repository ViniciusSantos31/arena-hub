"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { actionClient } from "@/lib/next-safe-action";
import { notifyTeamDraw } from "@/lib/push-notification";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import z from "zod/v4";

export const saveTeamsConfig = actionClient
  .inputSchema(
    z.object({
      matchId: z.string().min(1),
      teams: z.array(
        z.object({
          team: z.number().min(1),
          score: z.number().min(0),
          players: z.array(
            z.object({
              id: z.string().min(1),
              name: z.string().min(1).optional(),
              image: z.string().optional().nullable(),
              score: z.number().min(0),
            }),
          ),
        }),
      ),
      reserves: z.array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1).optional(),
          image: z.string().optional().nullable(),
          score: z.number().min(0),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, teams } = parsedInput;

    await Promise.all([
      ...teams.map(async (team) => {
        for (const player of team.players) {
          await db
            .update(playersTable)
            .set({ teamId: team.team })
            .where(eq(playersTable.id, player.id));
        }
      }),
      db
        .update(matchesTable)
        .set({ status: "team_sorted" })
        .where(eq(matchesTable.id, matchId)),
    ]);

    // Busca dados da partida e do grupo para a notificação
    const match = await db.query.matchesTable.findFirst({
      where: (m, { eq }) => eq(m.id, matchId),
    });

    if (!match) return;

    if (!match.organizationId) return;

    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.id, match.organizationId!),
    });

    if (!organization) return;

    // Busca todos os jogadores da partida (incluindo os que foram sorteados agora)
    const allPlayers = await db.query.playersTable.findMany({
      where: (p, { eq }) => eq(p.matchId, matchId),
    });

    const participantIds = allPlayers
      .map((p) => p.userId)
      .filter((id): id is string => !!id);

    if (participantIds.length === 0) return;

    const matchDate = dayjs(match.date).format("DD/MM [às] HH[h]mm");

    await notifyTeamDraw({
      groupName: organization.name,
      matchDate,
      groupCode: organization.code,
      matchId,
      participantIds,
    }).catch(console.error);
  });
