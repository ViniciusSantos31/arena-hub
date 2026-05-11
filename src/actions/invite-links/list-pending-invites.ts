"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { directInvitesTable } from "@/db/schema/direct-invite";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, desc, eq, max, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { decryptInviteToken, getRequestBaseUrl } from "./_utils";

export const listMyPendingInvites = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const invites = await db
    .select({
      id: directInvitesTable.id,
      status: directInvitesTable.status,
      createdAt: directInvitesTable.createdAt,
      inviteLinkId: directInvitesTable.inviteLinkId,
      organizationId: directInvitesTable.organizationId,
      orgName: organization.name,
      orgLogo: organization.logo,
      orgCode: organization.code,
      orgMaxPlayers: organization.maxPlayers,
      sentByName: usersTable.name,
      tokenCiphertext: organizationInviteLink.tokenCiphertext,
      tokenIv: organizationInviteLink.tokenIv,
      tokenTag: organizationInviteLink.tokenTag,
      revokedAt: organizationInviteLink.revokedAt,
    })
    .from(directInvitesTable)
    .innerJoin(
      organization,
      eq(directInvitesTable.organizationId, organization.id),
    )
    .innerJoin(usersTable, eq(directInvitesTable.sentByUserId, usersTable.id))
    .leftJoin(
      organizationInviteLink,
      eq(directInvitesTable.inviteLinkId, organizationInviteLink.id),
    )
    .where(
      and(
        eq(directInvitesTable.targetUserId, session.user.id),
        eq(directInvitesTable.status, "pending"),
      ),
    )
    .orderBy(desc(directInvitesTable.createdAt));

  if (invites.length === 0) return [];

  const orgIds = invites.map((i) => i.organizationId);

  const [memberCounts, lastActivities] = await Promise.all([
    db
      .select({
        organizationId: member.organizationId,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(member)
      .where(
        sql`${member.organizationId} = ANY(ARRAY[${sql.raw(orgIds.map((id) => `'${id}'`).join(","))}]::text[])`,
      )
      .groupBy(member.organizationId),

    db
      .select({
        organizationId: matchesTable.organizationId,
        lastDate: max(matchesTable.date),
      })
      .from(matchesTable)
      .where(
        sql`${matchesTable.organizationId} = ANY(ARRAY[${sql.raw(orgIds.map((id) => `'${id}'`).join(","))}]::text[])`,
      )
      .groupBy(matchesTable.organizationId),
  ]);

  const memberCountMap = new Map(
    memberCounts.map((r) => [r.organizationId, r.count]),
  );
  const lastActivityMap = new Map(
    lastActivities.map((r) => [r.organizationId, r.lastDate]),
  );

  const baseUrl = await getRequestBaseUrl();

  return invites.map((invite) => {
    let invitePath: string | null = null;
    if (
      invite.tokenCiphertext &&
      invite.tokenIv &&
      invite.tokenTag &&
      !invite.revokedAt
    ) {
      const token = decryptInviteToken({
        tokenCiphertext: invite.tokenCiphertext,
        tokenIv: invite.tokenIv,
        tokenTag: invite.tokenTag,
      });
      invitePath = `/invite/${token}`;
    }

    const lastDate = lastActivityMap.get(invite.organizationId);
    const lastActivity = lastDate
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
          .format(lastDate)
          .replace(".", "")
      : null;

    return {
      id: invite.id,
      status: invite.status,
      createdAt: invite.createdAt.toISOString(),
      organization: {
        id: invite.organizationId,
        name: invite.orgName,
        logo: invite.orgLogo,
        code: invite.orgCode,
        maxPlayers: invite.orgMaxPlayers,
        membersCount: memberCountMap.get(invite.organizationId) ?? 0,
        lastActivity,
      },
      sentBy: invite.sentByName,
      invitePath,
      inviteUrl: invitePath
        ? baseUrl
          ? `${baseUrl}${invitePath}`
          : null
        : null,
      isLinkValid: !!invitePath,
    };
  });
});
