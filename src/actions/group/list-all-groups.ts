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
import { and, eq, sql } from "drizzle-orm";
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

  const enriched = await Promise.all(
    allOrgs.map(async (org) => {
      const memberCount = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(member)
        .where(eq(member.organizationId, org.id))
        .then((rows) => rows[0]?.count ?? 0);

      const myMembership = await db.query.member.findFirst({
        where: and(eq(member.organizationId, org.id), eq(member.userId, userId)),
        columns: { id: true },
      });

      if (myMembership) {
        return {
          ...org,
          memberCount,
          userStatus: "member" as GroupUserStatus,
          inviteToken: null,
        };
      }

      const myRequest = await db.query.requestsTable.findFirst({
        where: and(
          eq(requestsTable.organizationId, org.id),
          eq(requestsTable.userId, userId),
          eq(requestsTable.status, "pending"),
        ),
        columns: { id: true, status: true },
      });

      if (myRequest) {
        return {
          ...org,
          memberCount,
          userStatus: "pending_request" as GroupUserStatus,
          inviteToken: null,
        };
      }

      const pendingInvite = await db.query.directInvitesTable.findFirst({
        where: and(
          eq(directInvitesTable.organizationId, org.id),
          eq(directInvitesTable.targetUserId, userId),
          eq(directInvitesTable.status, "pending"),
        ),
        columns: { id: true, inviteLinkId: true },
      });

      if (pendingInvite?.inviteLinkId) {
        const link = await db.query.organizationInviteLink.findFirst({
          where: and(
            eq(organizationInviteLink.id, pendingInvite.inviteLinkId),
          ),
          columns: {
            tokenCiphertext: true,
            tokenIv: true,
            tokenTag: true,
            revokedAt: true,
            expiresAt: true,
          },
        });

        if (link && !link.revokedAt) {
          const isExpired =
            link.expiresAt && link.expiresAt.getTime() <= Date.now();
          if (!isExpired) {
            const token = decryptInviteToken({
              tokenCiphertext: link.tokenCiphertext,
              tokenIv: link.tokenIv,
              tokenTag: link.tokenTag,
            });
            return {
              ...org,
              memberCount,
              userStatus: "approved_invite" as GroupUserStatus,
              inviteToken: token,
            };
          }
        }
      }

      return {
        ...org,
        memberCount,
        userStatus: null as GroupUserStatus,
        inviteToken: null,
      };
    }),
  );

  return enriched;
});
