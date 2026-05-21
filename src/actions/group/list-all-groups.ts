"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { directInvitesTable } from "@/db/schema/direct-invite";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { requestsTable } from "@/db/schema/request";
import { decryptInviteToken } from "@/actions/invite-links/_utils";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";

export type GroupUserStatus =
  | "member"
  | "pending_request"
  | "approved_invite"
  | null;

export const listAllGroups = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const userId = session.user.id;

  const allOrgs = await db.query.organization.findMany({
    columns: {
      id: true,
      name: true,
      logo: true,
      code: true,
      private: true,
      maxPlayers: true,
      createdAt: true,
    },
  });

  if (allOrgs.length === 0) return [];

  const orgIds = allOrgs.map((o) => o.id);

  // Batch all lookups in parallel — elimina N+1 queries
  const [memberCounts, myMemberships, myRequests, myInvites] =
    await Promise.all([
      db
        .select({
          organizationId: member.organizationId,
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(member)
        .where(inArray(member.organizationId, orgIds))
        .groupBy(member.organizationId),

      db.query.member.findMany({
        where: and(
          inArray(member.organizationId, orgIds),
          eq(member.userId, userId),
        ),
        columns: { organizationId: true },
      }),

      db.query.requestsTable.findMany({
        where: and(
          inArray(requestsTable.organizationId, orgIds),
          eq(requestsTable.userId, userId),
          eq(requestsTable.status, "pending"),
        ),
        columns: { organizationId: true },
      }),

      db.query.directInvitesTable.findMany({
        where: and(
          inArray(directInvitesTable.organizationId, orgIds),
          eq(directInvitesTable.targetUserId, userId),
          eq(directInvitesTable.status, "pending"),
        ),
        columns: { organizationId: true, inviteLinkId: true },
      }),
    ]);

  // Busca os invite links em lote para os convites pendentes
  const inviteLinkIds = myInvites
    .map((i) => i.inviteLinkId)
    .filter((id): id is string => !!id);

  const inviteLinks =
    inviteLinkIds.length > 0
      ? await db.query.organizationInviteLink.findMany({
          where: inArray(organizationInviteLink.id, inviteLinkIds),
          columns: {
            id: true,
            tokenCiphertext: true,
            tokenIv: true,
            tokenTag: true,
            revokedAt: true,
            expiresAt: true,
          },
        })
      : [];

  // Lookup maps para O(1) por organização
  const memberCountMap = new Map(
    memberCounts.map((r) => [r.organizationId, r.count]),
  );
  const membershipSet = new Set(myMemberships.map((m) => m.organizationId));
  const requestSet = new Set(myRequests.map((r) => r.organizationId));
  const inviteByOrgId = new Map(
    myInvites.map((i) => [i.organizationId, i.inviteLinkId]),
  );
  const linkById = new Map(inviteLinks.map((l) => [l.id, l]));

  const now = Date.now();

  return allOrgs.map((org) => {
    const memberCount = memberCountMap.get(org.id) ?? 0;

    if (membershipSet.has(org.id)) {
      return { ...org, memberCount, userStatus: "member" as GroupUserStatus, inviteToken: null };
    }

    if (requestSet.has(org.id)) {
      return { ...org, memberCount, userStatus: "pending_request" as GroupUserStatus, inviteToken: null };
    }

    const inviteLinkId = inviteByOrgId.get(org.id);
    if (inviteLinkId) {
      const link = linkById.get(inviteLinkId);
      if (link && !link.revokedAt) {
        const isExpired = link.expiresAt && link.expiresAt.getTime() <= now;
        if (!isExpired) {
          const token = decryptInviteToken({
            tokenCiphertext: link.tokenCiphertext,
            tokenIv: link.tokenIv,
            tokenTag: link.tokenTag,
          });
          return { ...org, memberCount, userStatus: "approved_invite" as GroupUserStatus, inviteToken: token };
        }
      }
    }

    return { ...org, memberCount, userStatus: null as GroupUserStatus, inviteToken: null };
  });
});
