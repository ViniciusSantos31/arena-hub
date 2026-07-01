"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { directInvitesTable } from "@/db/schema/direct-invite";
import {
  organizationInviteLink,
  organizationInviteLinkUse,
} from "@/db/schema/invite-link";
import { punishmentTable } from "@/db/schema/punishment";
import { requestsTable } from "@/db/schema/request";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, gte, inArray, sql } from "drizzle-orm";
import z from "zod";

type InviteLinkStatus = "revoked" | "expired" | "max-uses-reached" | "active";

function getInviteLinkStatus(
  link: {
    revokedAt: Date | null;
    expiresAt: Date | null;
    maxUses: number | null;
  },
  usesCount: number,
): InviteLinkStatus {
  if (link.revokedAt) return "revoked";
  if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) return "expired";
  if (link.maxUses && usesCount >= link.maxUses) return "max-uses-reached";
  return "active";
}

function getThirtyDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
}

export interface AdminGroupDetail {
  group: {
    id: string;
    code: string;
    name: string;
    private: boolean;
    logo: string | null;
    maxPlayers: number;
    rules: string | null;
    createdAt: string;
    memberCount: number;
    owner: { name: string; email: string; image: string | null } | null;
    lastActivityAt: string;
    paidMatchesFeatureEnabled: boolean;
    occupancyRate: number;
    matchesLast30d: number;
    matchCompletionRate: number;
    pendingJoinRequests: number;
    activeInviteLinks: number;
    recentPunishments: number;
  };
  members: Array<{
    id: string;
    role: "member" | "admin" | "guest" | "owner";
    score: number;
    joinedAt: string;
    user: { id: string; name: string; email: string; image: string | null };
  }>;
  matches: Array<{
    id: string;
    title: string;
    status:
      | "scheduled"
      | "open_registration"
      | "closed_registration"
      | "team_sorted"
      | "completed"
      | "cancelled";
    date: string;
    time: string;
    sport: string;
    category: string;
    location: string;
    minPlayers: number;
    maxPlayers: number;
    createdAt: string;
    updatedAt: string;
  }>;
  inviteLinks: Array<{
    id: string;
    label: string | null;
    defaultRole: "guest" | "member";
    expiresAt: string | null;
    maxUses: number | null;
    revokedAt: string | null;
    revokedReason: string | null;
    createdAt: string;
    usesCount: number;
    status: InviteLinkStatus;
  }>;
  joinRequests: Array<{
    id: string;
    message: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string; image: string | null };
  }>;
}

function getLatestDate(dates: Array<Date | null | undefined>): Date | null {
  const filtered = dates.filter(Boolean) as Date[];
  if (filtered.length === 0) return null;
  return filtered.reduce((max, cur) => (cur > max ? cur : max), filtered[0]);
}

function rolePriority(role: string | null | undefined) {
  switch (role) {
    case "owner":
      return 0;
    case "admin":
      return 1;
    case "member":
      return 2;
    case "guest":
      return 3;
    default:
      return 99;
  }
}

export const getAdminGroupDetail = actionClient
  .inputSchema(z.object({ code: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const group = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.code),
      columns: {
        id: true,
        code: true,
        name: true,
        private: true,
        logo: true,
        maxPlayers: true,
        rules: true,
        createdAt: true,
        paidMatchesFeatureEnabled: true,
      },
      with: {
        members: {
          columns: { id: true, role: true, score: true, createdAt: true, userId: true },
          with: {
            user: {
              columns: { id: true, name: true, email: true, image: true },
            },
          },
        },
        matches: {
          columns: {
            id: true,
            title: true,
            status: true,
            date: true,
            time: true,
            sport: true,
            category: true,
            location: true,
            minPlayers: true,
            maxPlayers: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!group) {
      throw new Error("Grupo não encontrado");
    }

    const thirtyDaysAgo = getThirtyDaysAgo();
    const memberCount = group.members.length;
    const occupancyRate =
      group.maxPlayers > 0
        ? Math.min(100, Math.round((memberCount * 100) / group.maxPlayers))
        : 0;

    const matchesLast30d = group.matches.filter(
      (m) => m.createdAt >= thirtyDaysAgo,
    ).length;
    const completedMatches = group.matches.filter(
      (m) => m.status === "completed",
    ).length;
    const cancelledMatches = group.matches.filter(
      (m) => m.status === "cancelled",
    ).length;
    const matchCompletionRate =
      completedMatches + cancelledMatches === 0
        ? 0
        : Math.round(
            (completedMatches / (completedMatches + cancelledMatches)) * 1000,
          ) / 10;

    const [
      pendingJoinRequestsRow,
      recentPunishmentsRow,
      allInviteLinks,
      directLinks,
      pendingJoinRequestsList,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(requestsTable)
        .where(
          and(
            eq(requestsTable.organizationId, group.id),
            eq(requestsTable.status, "pending"),
          ),
        ),
      db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(punishmentTable)
        .where(
          and(
            eq(punishmentTable.organizationId, group.id),
            gte(punishmentTable.createdAt, thirtyDaysAgo),
          ),
        ),
      db.query.organizationInviteLink.findMany({
        where: eq(organizationInviteLink.organizationId, group.id),
        orderBy: (t, { desc }) => [desc(t.createdAt)],
      }),
      db.query.directInvitesTable.findMany({
        where: eq(directInvitesTable.organizationId, group.id),
        columns: { inviteLinkId: true },
      }),
      group.private
        ? db.query.requestsTable.findMany({
            where: and(
              eq(requestsTable.organizationId, group.id),
              eq(requestsTable.status, "pending"),
            ),
            with: {
              user: {
                columns: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: (r, { asc }) => [asc(r.createdAt)],
          })
        : Promise.resolve([]),
    ]);

    const pendingJoinRequests = pendingJoinRequestsRow[0]?.count ?? 0;
    const recentPunishments = recentPunishmentsRow[0]?.count ?? 0;

    const directLinkIds = new Set(
      directLinks.map((d) => d.inviteLinkId).filter(Boolean) as string[],
    );
    const inviteLinksRaw = allInviteLinks.filter((l) => !directLinkIds.has(l.id));
    const linkIds = inviteLinksRaw.map((l) => l.id);

    const uses =
      linkIds.length > 0
        ? await db
            .select({
              inviteLinkId: organizationInviteLinkUse.inviteLinkId,
              usesCount: sql<number>`count(*)`.mapWith(Number),
            })
            .from(organizationInviteLinkUse)
            .where(inArray(organizationInviteLinkUse.inviteLinkId, linkIds))
            .groupBy(organizationInviteLinkUse.inviteLinkId)
        : [];

    const usesMap = new Map(uses.map((u) => [u.inviteLinkId, u.usesCount]));

    const inviteLinks = inviteLinksRaw.map((l) => {
      const usesCount = usesMap.get(l.id) ?? 0;
      return {
        id: l.id,
        label: l.label,
        defaultRole: l.defaultRole,
        expiresAt: l.expiresAt?.toISOString() ?? null,
        maxUses: l.maxUses,
        revokedAt: l.revokedAt?.toISOString() ?? null,
        revokedReason: l.revokedReason ?? null,
        createdAt: l.createdAt.toISOString(),
        usesCount,
        status: getInviteLinkStatus(l, usesCount),
      };
    });

    const activeInviteLinks = inviteLinks.filter((l) => l.status === "active").length;

    const ownerMember =
      group.members.find((m) => m.role === "owner") ??
      group.members.find((m) => m.role === "admin") ??
      null;

    const latestMemberAt = getLatestDate(group.members.map((m) => m.createdAt));
    const latestMatchAt = getLatestDate(group.matches.map((m) => m.updatedAt ?? m.createdAt));
    const latestActivityAt =
      getLatestDate([latestMemberAt, latestMatchAt, group.createdAt]) ?? group.createdAt;

    const members = group.members
      .map((m) => ({
        id: m.id,
        role: (m.role ?? "member") as "member" | "admin" | "guest" | "owner",
        score: m.score,
        joinedAt: m.createdAt.toISOString(),
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image ?? null,
        },
      }))
      .sort((a, b) => {
        const prio = rolePriority(a.role) - rolePriority(b.role);
        if (prio !== 0) return prio;
        return b.joinedAt.localeCompare(a.joinedAt);
      });

    const matches = group.matches
      .map((m) => ({
        id: m.id,
        title: m.title,
        status: m.status,
        date: m.date.toISOString(),
        time: m.time,
        sport: m.sport,
        category: m.category,
        location: m.location,
        minPlayers: m.minPlayers,
        maxPlayers: m.maxPlayers,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const data: AdminGroupDetail = {
      group: {
        id: group.id,
        code: group.code,
        name: group.name,
        private: group.private,
        logo: group.logo ?? null,
        maxPlayers: group.maxPlayers,
        rules: group.rules ?? null,
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
        paidMatchesFeatureEnabled: group.paidMatchesFeatureEnabled,
        occupancyRate,
        matchesLast30d,
        matchCompletionRate,
        pendingJoinRequests,
        activeInviteLinks,
        recentPunishments,
      },
      members,
      matches,
      inviteLinks,
      joinRequests: pendingJoinRequestsList.map((req) => ({
        id: req.id,
        message: req.message,
        createdAt: req.createdAt,
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          image: req.user.image ?? null,
        },
      })),
    };

    return data;
  });
