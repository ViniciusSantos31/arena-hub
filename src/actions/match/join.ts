"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";

export const joinMatch = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId, organizationCode } = parsedInput;

    // Verify user authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const userId = session.user.id;

    // Get membership information
    const membership = await getUserMembership({
      organizationCode,
    });

    const membershipInfo = membership.data;

    if (!membershipInfo) {
      throw new Error("User is not a member of the organization");
    }

    // Verify if the user is already joined to the match
    const isAlreadyJoined = await db
      .select()
      .from(playersTable)
      .where(
        and(eq(playersTable.matchId, matchId), eq(playersTable.userId, userId)),
      )
      .limit(1);

    if (isAlreadyJoined.length > 0) {
      const userInMatch = isAlreadyJoined[0];

      await db.delete(playersTable).where(eq(playersTable.id, userInMatch.id));
      return;
    }

    // Verify if there are available slots in the match
    const currentPlayersCount = await db
      .select({
        maxPlayers: matchesTable.maxPlayers,
        playersCount: count(playersTable.userId),
      })
      .from(matchesTable)
      .leftJoin(playersTable, eq(matchesTable.id, playersTable.matchId))
      .where(eq(matchesTable.id, matchId))
      .groupBy(matchesTable.id)
      .then((res) => res[0]);

    const hasAvailableSlots =
      (currentPlayersCount.maxPlayers ?? 0) >
      (currentPlayersCount.playersCount ?? 0);

    // TODO: Put the user in the waiting list if no slots are available
    if (!hasAvailableSlots) {
      throw new Error("No available slots in the match");
    }

    // Add the user to the match
    await db.insert(playersTable).values({
      matchId,
      userId,
      score: membershipInfo.score,
    });
  });

export const getUserMatchPlayer = actionClient
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
      .select()
      .from(playersTable)
      .where(
        and(eq(playersTable.matchId, matchId), eq(playersTable.userId, userId)),
      )
      .limit(1)
      .then((res) => res[0]);

    return player || null;
  });
