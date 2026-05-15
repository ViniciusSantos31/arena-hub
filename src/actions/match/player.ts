"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
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
  confirmedAt: Date | null;
  teamId: number | null;
  memberId: string | null;
  paymentStatus: "pending" | "paid" | "refunded" | "exempt";
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
    memberId: player.memberId,
    score: player.member?.score || 0,
    confirmed: player.confirmed,
    confirmedAt: player.confirmedAt,
    waitingQueue: player.waitingQueue,
    paymentStatus: player.paymentStatus,
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

    const activeResponse = response.filter((player) => !player.bannedFromMatch);

    const mainList = activeResponse.filter((player) => !player.waitingQueue);
    const waitingList = activeResponse.filter((player) => player.waitingQueue);

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

    const matchRow = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.id, matchId),
      columns: { isPaid: true },
    });

    if (!matchRow) {
      throw new Error("Partida não encontrada");
    }

    const existing = await db.query.playersTable.findFirst({
      where: and(
        eq(playersTable.matchId, matchId),
        eq(playersTable.userId, userId),
      ),
    });

    if (!existing) {
      throw new Error("Player not found in the match");
    }

    if (matchRow.isPaid && existing.paymentStatus === "pending") {
      throw new Error(
        "Conclua o pagamento pelo link enviado para participar desta partida.",
      );
    }

    if (existing.confirmed) {
      return {
        id: existing.id,
        confirmed: existing.confirmed,
      };
    }

    const player = await db
      .update(playersTable)
      .set({ confirmed: true, confirmedAt: new Date() })
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
