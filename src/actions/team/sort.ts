"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { can } from "@/hooks/use-guard";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";
import { listMatchPlayers, ListMatchPlayersReturn } from "../match/player";
import { Player, Team } from "./types";

const getFinalPlayerList = (
  players: ListMatchPlayersReturn,
): ListMatchPlayersReturn["players"] => {
  const { players: mainPlayers, waitingQueue } = players;

  return [
    ...mainPlayers.filter((player) => player.confirmed),
    ...waitingQueue.filter((player) => player.confirmed),
  ];
};

export const sortTeams = actionClient
  .inputSchema(
    z.object({
      matchId: z.string().min(1),
      organizationCode: z.string().min(1),
      nTeams: z.number().min(2).max(20),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, organizationCode, nTeams } = parsedInput;

    const membership = await getUserMembership({
      organizationCode,
    }).then((res) => res.data);

    if (!membership) {
      return {
        teams: [] as Team[],
        reserves: [],
      };
    }

    const canSortTeams = can(membership, ["team:create"]);

    if (!canSortTeams) {
      return {
        teams: [] as Team[],
        reserves: [],
      };
    }

    const players = await listMatchPlayers({
      matchId,
    }).then((res) => res.data);

    const matchMaxPlayers = await db
      .select()
      .from(matchesTable)
      .where(eq(matchesTable.id, matchId))
      .then((res) => res[0]?.maxPlayers ?? 0);

    if (
      !players ||
      (players.players.length === 0 && players.waitingQueue.length === 0)
    ) {
      return {
        teams: [] as Team[],
        reserves: [],
      };
    }

    const finalPlayers = getFinalPlayerList(players).slice(0, matchMaxPlayers);

    const playersPerTeam = Math.floor(finalPlayers.length / nTeams);
    const playersSortedByScore = [...finalPlayers].sort(
      (a, b) => (b?.score ?? 0) - (a?.score ?? 0),
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
          score: player.score ?? 0,
        });
        continue;
      }

      const pickedTeam = availableTeams.reduce((prev, curr) =>
        prev.score <= curr.score ? prev : curr,
      );

      pickedTeam.players.push({
        id: player.id,
        score: player.score ?? 0,
        name: player.name,
        image: player.image,
        confirmed: player.confirmed,
      });

      pickedTeam.score += player.score ?? 0;
    }

    return {
      teams: teams.map((team) => ({
        ...team,
        score: team.players.length > 0 ? team.score / team.players.length : 0,
      })),
      reserves,
    };
  });

export const sortTeamsByPots = actionClient
  .inputSchema(
    z.object({
      matchId: z.string().min(1),
      organizationCode: z.string().min(1),
      nTeams: z.number().min(2).max(20),
      pots: z.array(
        z.object({
          id: z.string(),
          label: z.string(),
          playerIds: z.array(z.string()),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, organizationCode, nTeams, pots } = parsedInput;

    const membership = await getUserMembership({ organizationCode }).then(
      (res) => res.data,
    );

    if (!membership) return { teams: [] as Team[], reserves: [] };

    const canSortTeams = can(membership, ["team:create"]);
    if (!canSortTeams) return { teams: [] as Team[], reserves: [] };

    const players = await listMatchPlayers({ matchId }).then((res) => res.data);

    if (!players) return { teams: [] as Team[], reserves: [] };

    const finalPlayers = getFinalPlayerList(players);

    // Monta mapa id -> player com score
    const allPlayersMap = new Map(finalPlayers.map((p) => [p.id, p]));

    // Separa jogadores por pote, ignorando os sem pote
    const potsWithPlayers = pots
      .map((pot) => ({
        ...pot,
        players: pot.playerIds
          .map((id) => allPlayersMap.get(id))
          .filter(Boolean) as typeof finalPlayers,
      }))
      .filter((pot) => pot.players.length > 0);

    // Jogadores sem nenhum pote vão para reservas
    const assignedIds = new Set(pots.flatMap((p) => p.playerIds));
    const unassigned = finalPlayers.filter((p) => !assignedIds.has(p.id));

    const teams: Team[] = Array.from({ length: nTeams }, (_, i) => ({
      team: i + 1,
      players: [],
      score: 0,
    }));

    // Para cada pote, distribui 1 jogador por time (sort por score desc)
    for (const pot of potsWithPlayers) {
      const sorted = [...pot.players].sort(
        (a, b) => (b?.score ?? 0) - (a?.score ?? 0),
      );
      sorted.forEach((player, i) => {
        const team = teams[i % nTeams];
        team.players.push({
          id: player.id,
          score: player.score ?? 0,
          name: player.name,
          image: player.image,
          confirmed: player.confirmed,
        });
        team.score += player.score ?? 0;
      });
    }

    const reserves: Player[] = unassigned.map((p) => ({
      id: p.id,
      score: p.score ?? 0,
      name: p.name,
      image: p.image,
      confirmed: p.confirmed,
    }));

    return {
      teams: teams.map((team) => ({
        ...team,
        score: team.players.length > 0 ? team.score / team.players.length : 0,
      })),
      reserves,
    };
  });
