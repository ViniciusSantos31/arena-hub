"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { actionClient } from "@/lib/next-safe-action";
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
  });
