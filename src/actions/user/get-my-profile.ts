"use server";

import { db } from "@/db";
import { accountsTable, organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { playersTable } from "@/db/schema/player";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

export const getMyProfile = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.user.id;

  const [profile, groupCount, matchCount, recentMatches, linkedAccounts] =
    await Promise.all([
      db.query.usersTable.findFirst({
        where: eq(usersTable.id, userId),
        columns: {
          bio: true,
          location: true,
          lookingForGroup: true,
        },
      }),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(member)
        .where(eq(member.userId, userId))
        .then((rows) => rows[0]?.count ?? 0),

      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(playersTable)
        .innerJoin(matchesTable, eq(playersTable.matchId, matchesTable.id))
        .where(
          and(
            eq(playersTable.userId, userId),
            eq(playersTable.confirmed, true),
            eq(matchesTable.status, "completed"),
          ),
        )
        .then((rows) => rows[0]?.count ?? 0),

      db
        .select({
          id: matchesTable.id,
          date: matchesTable.date,
          confirmed: playersTable.confirmed,
          groupName: organization.name,
        })
        .from(playersTable)
        .innerJoin(matchesTable, eq(playersTable.matchId, matchesTable.id))
        .innerJoin(
          organization,
          eq(matchesTable.organizationId, organization.id),
        )
        .where(eq(playersTable.userId, userId))
        .orderBy(desc(matchesTable.date))
        .limit(5),

      db
        .select({
          id: accountsTable.id,
          providerId: accountsTable.providerId,
          createdAt: accountsTable.createdAt,
        })
        .from(accountsTable)
        .where(eq(accountsTable.userId, userId)),
    ]);

  return {
    profile: {
      bio: profile?.bio ?? null,
      location: profile?.location ?? null,
      lookingForGroup: profile?.lookingForGroup ?? false,
    },
    stats: {
      matches: matchCount,
      groups: groupCount,
    },
    recentMatches: recentMatches.map((m) => ({
      id: m.id,
      group: m.groupName,
      date: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
        .format(m.date)
        .replace(".", ""),
      confirmed: m.confirmed,
    })),
    linkedAccounts: linkedAccounts.map((acc) => ({
      id: acc.id,
      providerId: acc.providerId,
      createdAt: acc.createdAt.toISOString(),
    })),
  };
});
