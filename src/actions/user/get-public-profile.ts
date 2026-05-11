"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { playersTable } from "@/db/schema/player";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export const getPublicProfile = actionClient
  .inputSchema(z.object({ userId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { userId } = parsedInput;

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
      columns: {
        id: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        lookingForGroup: true,
      },
    });

    if (!user) return null;

    const [groupCountResult, matchCountResult, recentMatches, viewerMembers] =
      await Promise.all([
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
          .select({ organizationId: member.organizationId })
          .from(member)
          .where(eq(member.userId, session.user.id)),
      ]);

    const viewerOrgIds = viewerMembers.map((m) => m.organizationId);

    const commonGroups =
      viewerOrgIds.length > 0
        ? await db
            .select({
              id: organization.id,
              name: organization.name,
              code: organization.code,
              image: organization.logo,
            })
            .from(member)
            .innerJoin(organization, eq(member.organizationId, organization.id))
            .where(
              and(
                eq(member.userId, userId),
                inArray(member.organizationId, viewerOrgIds),
              ),
            )
        : [];

    return {
      user,
      stats: {
        matches: matchCountResult,
        groups: groupCountResult,
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
      commonGroups: commonGroups.map((g) => ({
        id: g.id,
        name: g.name,
        code: g.code,
        role: "Membro",
        memberCount: 0,
        image: g.image,
      })),
    };
  });
