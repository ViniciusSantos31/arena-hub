"use server";

import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";
import z from "zod/v4";

export const listTeamPlayers = actionClient
  .inputSchema(
    z.object({
      matchId: z.string().min(1),
    }),
  )
  .outputSchema(
    z.object({
      teams: z.array(
        z.object({
          team: z.number().nullable(),
          score: z.number(),
          players: z.array(
            z.object({
              id: z.string(),
              score: z.number(),
              name: z.string().optional(),
              image: z.string().nullable().optional(),
            }),
          ),
        }),
      ),
      reserves: z.array(
        z.object({
          id: z.string(),
          score: z.number(),
          name: z.string().optional(),
          image: z.string().nullable().optional(),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const match = await db.query.matchesTable.findFirst({
      where: (matchesTable, { eq }) => eq(matchesTable.id, matchId),
      with: {
        players: {
          with: {
            user: {
              columns: {
                name: true,
                image: true,
              },
            },
            member: {
              columns: {
                score: true,
              },
            },
          },
        },
      },
    });

    if (!match) {
      return {
        teams: [],
        reserves: [],
      };
    }

    if (
      match.status === "open_registration" ||
      match.status === "closed_registration"
    ) {
      return {
        teams: [],
        reserves: [],
      };
    }

    const teams = match.players.reduce<{
      [teamNumber: number]: Array<{
        id: string;
        score: number;
        name?: string;
        image?: string | null;
      }>;
    }>((acc, player) => {
      if (player.teamId !== null) {
        if (!acc[player.teamId]) {
          acc[player.teamId] = [];
        }
        acc[player.teamId].push({
          id: player.id,
          score: player.member?.score ?? 0,
          name: player.user?.name,
          image: player.user?.image,
        });
      }
      return acc;
    }, {});

    const formattedTeams = Object.entries(teams).map(([team, players]) => ({
      team: Number(team),
      players,
      score:
        players.reduce((acc, player) => acc + player.score, 0) / players.length,
    }));

    const reserves = match.players
      .filter((player) => player.teamId === null)
      .map((player) => ({
        id: player.id,
        score: player.member?.score ?? 0,
        name: player.user?.name,
        image: player.user?.image ?? null,
      }));

    return {
      teams: formattedTeams,
      reserves,
    };
  });
