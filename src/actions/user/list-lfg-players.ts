"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { playersTable } from "@/db/schema/player";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { headers } from "next/headers";

export const listLfgPlayers = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const players = await db.query.usersTable.findMany({
    where: and(
      eq(usersTable.lookingForGroup, true),
      ne(usersTable.id, session.user.id),
    ),
    columns: {
      id: true,
      name: true,
      image: true,
      bio: true,
      location: true,
    },
  });

  if (players.length === 0) return [];

  const playerIds = players.map((p) => p.id);

  const myMemberships = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, session.user.id));

  const myOrgIds = myMemberships.map((m) => m.organizationId);

  const [groupCounts, matchCounts, commonGroupCounts] = await Promise.all([
    db
      .select({
        userId: member.userId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(member)
      .where(inArray(member.userId, playerIds))
      .groupBy(member.userId),

    db
      .select({
        userId: playersTable.userId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(playersTable)
      .innerJoin(matchesTable, eq(playersTable.matchId, matchesTable.id))
      .where(
        and(
          inArray(playersTable.userId, playerIds),
          eq(playersTable.confirmed, true),
          eq(matchesTable.status, "completed"),
        ),
      )
      .groupBy(playersTable.userId),

    myOrgIds.length > 0
      ? db
          .select({
            userId: member.userId,
            count: sql<number>`count(*)`.mapWith(Number),
          })
          .from(member)
          .where(
            and(
              inArray(member.userId, playerIds),
              inArray(member.organizationId, myOrgIds),
            ),
          )
          .groupBy(member.userId)
      : Promise.resolve([]),
  ]);

  const groupCountMap = new Map(groupCounts.map((r) => [r.userId, r.count]));
  const matchCountMap = new Map(matchCounts.map((r) => [r.userId, r.count]));
  const commonGroupCountMap = new Map(
    commonGroupCounts.map((r) => [r.userId, r.count]),
  );

  return players
    .map((player) => ({
      ...player,
      groupsCount: groupCountMap.get(player.id) ?? 0,
      matchesCount: matchCountMap.get(player.id) ?? 0,
      commonGroupsCount: commonGroupCountMap.get(player.id) ?? 0,
    }))
    .sort((a, b) => b.commonGroupsCount - a.commonGroupsCount);
});
