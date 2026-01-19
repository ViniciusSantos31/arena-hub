"use server";

import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";
import z from "zod/v4";

export const listMatchPlayers = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const response = await db.query.playersTable.findMany({
      where: (playersTable, { eq }) => eq(playersTable.matchId, matchId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return response.map((player) => ({
      ...player,
      name: player.user?.name,
      image: player.user?.image,
      userId: player.user?.id,
    }));
  });
