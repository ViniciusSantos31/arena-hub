"use server";

import { db } from "@/db";
import { playersTable } from "@/db/schema/player";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

const buildReturnPlayer = (player: {
  id: string;
  userId: string | null;
  confirmed: boolean;
  waitingQueue: boolean;
  matchId: string | null;
  createdAt: Date;
  updatedAt: Date;
  teamId: number | null;
  memberId: string | null;
  user: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  member: {
    score: number;
  } | null;
}) => {
  return {
    id: player.id,
    name: player.user?.name,
    image: player.user?.image,
    userId: player.userId,
    score: player.member?.score,
    confirmed: player.confirmed,
    waitingQueue: player.waitingQueue,
  };
};

export type ListMatchPlayersReturn = {
  players: Array<ReturnType<typeof buildReturnPlayer>>;
  waitingQueue: Array<ReturnType<typeof buildReturnPlayer>>;
};

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
      orderBy: (playersTable, { asc }) => [asc(playersTable.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
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
    });

    const mainList = response.filter((player) => !player.waitingQueue);
    const waitingList = response.filter((player) => player.waitingQueue);

    return {
      players: mainList.map(buildReturnPlayer),
      waitingQueue: waitingList.map(buildReturnPlayer),
    };
  });

export const confirmMatchPresence = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    const player = await db
      .update(playersTable)
      .set({ confirmed: true })
      .where(
        and(eq(playersTable.matchId, matchId), eq(playersTable.userId, userId)),
      )
      .returning()
      .then((res) => res[0]);

    if (!player) {
      throw new Error("Player not found in the match");
    }

    return {
      id: player.id,
      confirmed: player.confirmed,
    };
  });
