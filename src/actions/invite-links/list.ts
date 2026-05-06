"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import {
  organizationInviteLink,
  organizationInviteLinkUse,
} from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { decryptInviteToken, getRequestBaseUrl } from "./_utils";

const getLinkStatus = (
  link: typeof organizationInviteLink.$inferSelect,
  usesCount: number,
): "revoked" | "expired" | "max-uses-reached" | "active" => {
  if (link.revokedAt) {
    return "revoked";
  }
  if (link.expiresAt && new Date(link.expiresAt).getTime() <= Date.now()) {
    return "expired";
  }
  if (link.maxUses && usesCount >= link.maxUses) {
    return "max-uses-reached";
  }
  return "active";
};

export const listInviteLinks = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });

    if (!org) {
      throw new Error("Grupo não encontrado");
    }

    const myMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, org.id),
        eq(member.userId, session.user.id),
      ),
    });

    const canManageInvites =
      myMembership?.role === "owner" || myMembership?.role === "admin";

    if (!canManageInvites) {
      throw new Error("Sem permissão para ver links de convite");
    }

    const links = await db.query.organizationInviteLink.findMany({
      where: eq(organizationInviteLink.organizationId, org.id),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
    });

    if (links.length === 0) {
      return { links: [] as const };
    }

    const linkIds = links.map((l) => l.id);

    const uses = await db
      .select({
        inviteLinkId: organizationInviteLinkUse.inviteLinkId,
        usesCount: sql<number>`count(*)`.mapWith(Number),
      })
      .from(organizationInviteLinkUse)
      .where(inArray(organizationInviteLinkUse.inviteLinkId, linkIds))
      .groupBy(organizationInviteLinkUse.inviteLinkId);

    const usesMap = new Map(uses.map((u) => [u.inviteLinkId, u.usesCount]));
    const baseUrl = await getRequestBaseUrl();

    return {
      links: links.map((l) => ({
        invitePath: (() => {
          const token = decryptInviteToken({
            tokenCiphertext: l.tokenCiphertext,
            tokenIv: l.tokenIv,
            tokenTag: l.tokenTag,
          });
          return `/invite/${token}`;
        })(),
        inviteUrl: (() => {
          if (!baseUrl) return null;
          const token = decryptInviteToken({
            tokenCiphertext: l.tokenCiphertext,
            tokenIv: l.tokenIv,
            tokenTag: l.tokenTag,
          });
          return `${baseUrl}/invite/${token}`;
        })(),
        id: l.id,
        label: l.label,
        defaultRole: l.defaultRole,
        expiresAt: l.expiresAt,
        maxUses: l.maxUses,
        revokedAt: l.revokedAt,
        revokedReason: l.revokedReason,
        createdAt: l.createdAt,
        updatedAt: l.updatedAt,
        usesCount: usesMap.get(l.id) ?? 0,
        status: getLinkStatus(l, usesMap.get(l.id) ?? 0),
      })),
    };
  });
