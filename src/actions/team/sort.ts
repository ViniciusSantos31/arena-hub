"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";
import { listMatchPlayers } from "../match/player";
import { Player, Team } from "./types";

export const sortTeams = actionClient
  .inputSchema(
    z.object({
      matchId: z.string().min(1),
      organizationId: z.string().min(1),
      nTeams: z.number().min(2).max(20),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, organizationId, nTeams } = parsedInput;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const membership = await getUserMembership({
      organizationId,
    }).then((res) => res.data);

    if (!membership) {
      return NextResponse.json(
        { error: "Afiliação à organização não encontrada" },
        { status: 403 },
      );
    }

    const canSortTeams = can(membership, ["team:create"]);

    if (!canSortTeams) {
      return NextResponse.json(
        { error: "Permissão negada para ordenar equipes" },
        { status: 403 },
      );
    }

    const players = await listMatchPlayers({
      matchId,
    }).then((res) => res.data);

    if (!players || players.length === 0) {
      return NextResponse.json(
        { error: "Nenhum jogador encontrado para esta partida" },
        { status: 404 },
      );
    }

    if (players.length % nTeams !== 0) {
      return NextResponse.json(
        {
          error: `Número de jogadores (${players.length}) não pode ser dividido igualmente em ${nTeams} times`,
        },
        { status: 400 },
      );
    }

    const playersPerTeam = Math.floor(players.length / nTeams);
    const playersSortedByScore = [...players].sort(
      (a, b) => (b.member?.score ?? 0) - (a.member?.score ?? 0),
    );

    const teams: Team[] = Array.from({ length: nTeams }, (_, index) => ({
      team: index + 1,
      players: [],
      score: 0,
    }));

    const reserves: Player[] = [];

    for (const player of playersSortedByScore) {
      const availableTeams = teams.filter(
        (team) => team.players.length < playersPerTeam,
      );

      if (availableTeams.length === 0) {
        reserves.push({
          ...player,
          score: player.member?.score ?? 0,
        });
        continue;
      }

      const pickedTeam = availableTeams.reduce((prev, curr) =>
        prev.score <= curr.score ? prev : curr,
      );

      pickedTeam.players.push({
        id: player.id,
        score: player.member?.score ?? 0,
        name: player.user?.name,
        image: player.user?.image,
      });

      pickedTeam.score += player.member?.score ?? 0;
    }

    await Promise.all([
      ...teams.map(async (team) => {
        for (const player of team.players) {
          await db
            .update(playersTable)
            .set({ teamId: team.team })
            .where(eq(playersTable.id, player.id));
        }
      }),
      await db
        .update(matchesTable)
        .set({ status: "team_sorted" })
        .where(eq(matchesTable.id, matchId)),
    ]);

    return {
      teams: teams.map((team) => ({
        ...team,
        score: team.players.length > 0 ? team.score / team.players.length : 0,
      })),
      reserves,
    };
  });
