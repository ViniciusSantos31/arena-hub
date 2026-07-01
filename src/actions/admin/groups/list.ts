"use server";

import { db } from "@/db";
import { requestsTable } from "@/db/schema/request";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { eq, sql } from "drizzle-orm";

export interface AdminGroupListItem {
  id: string;
  code: string;
  name: string;
  private: boolean;
  logo: string | null;
  maxPlayers: number;
  createdAt: string;
  memberCount: number;
  owner: { name: string; email: string; image: string | null } | null;
  lastActivityAt: string;
  occupancyRate: number;
  matchesLast30d: number;
  pendingJoinRequests: number;
}

function getLatestDate(dates: Array<Date | null | undefined>): Date | null {
  const filtered = dates.filter(Boolean) as Date[];
  if (filtered.length === 0) return null;
  return filtered.reduce((max, cur) => (cur > max ? cur : max), filtered[0]);
}

function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

export const listAdminGroups = actionClient.action(async () => {
  await assertAdmin();

  const thirtyDaysAgo = getThirtyDaysAgo();

  const [groups, pendingByOrg] = await Promise.all([
    db.query.organization.findMany({
      columns: {
        id: true,
        code: true,
        name: true,
        private: true,
        logo: true,
        maxPlayers: true,
        createdAt: true,
      },
      with: {
        members: {
          columns: { role: true, createdAt: true },
          with: {
            user: {
              columns: { name: true, email: true, image: true },
            },
          },
        },
        matches: {
          columns: { createdAt: true, updatedAt: true },
        },
      },
    }),
    db
      .select({
        organizationId: requestsTable.organizationId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(requestsTable)
      .where(eq(requestsTable.status, "pending"))
      .groupBy(requestsTable.organizationId),
  ]);

  const pendingMap = new Map(
    pendingByOrg.map((row) => [row.organizationId, row.count]),
  );

  const items: AdminGroupListItem[] = groups
    .map((group) => {
      const ownerMember =
        group.members.find((m) => m.role === "owner") ??
        group.members.find((m) => m.role === "admin") ??
        null;

      const latestMemberAt = getLatestDate(
        group.members.map((m) => m.createdAt),
      );
      const latestMatchAt = getLatestDate(
        group.matches.map((m) => m.updatedAt ?? m.createdAt),
      );
      const latestActivityAt =
        getLatestDate([latestMemberAt, latestMatchAt, group.createdAt]) ??
        group.createdAt;

      const memberCount = group.members.length;
      const occupancyRate =
        group.maxPlayers > 0
          ? Math.min(100, Math.round((memberCount * 100) / group.maxPlayers))
          : 0;

      return {
        id: group.id,
        code: group.code,
        name: group.name,
        private: group.private,
        logo: group.logo ?? null,
        maxPlayers: group.maxPlayers,
        createdAt: group.createdAt.toISOString(),
        memberCount,
        owner: ownerMember
          ? {
              name: ownerMember.user.name,
              email: ownerMember.user.email,
              image: ownerMember.user.image ?? null,
            }
          : null,
        lastActivityAt: latestActivityAt.toISOString(),
        occupancyRate,
        matchesLast30d: group.matches.filter((m) => m.createdAt >= thirtyDaysAgo)
          .length,
        pendingJoinRequests: pendingMap.get(group.id) ?? 0,
      };
    })
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));

  return { groups: items };
});
