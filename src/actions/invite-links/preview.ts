"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import {
  organizationInviteLink,
  organizationInviteLinkUse,
} from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { hashInviteToken } from "./_utils";

export type InvitePreviewStatus =
  | "ok"
  | "invalid"
  | "revoked"
  | "expired"
  | "max-uses-reached"
  | "group-full"
  | "already-member";

export const previewInviteLink = actionClient
  .inputSchema(
    z.object({
      token: z.string().min(10),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const tokenHash = hashInviteToken(parsedInput.token);

    const link = await db.query.organizationInviteLink.findFirst({
      where: eq(organizationInviteLink.tokenHash, tokenHash),
    });

    if (!link) {
      return { status: "invalid" as const };
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.id, link.organizationId),
    });

    if (!org) {
      return { status: "invalid" as const };
    }

    const now = new Date();

    if (link.revokedAt) {
      return {
        status: "revoked" as const,
        group: { code: org.code, name: org.name, logo: org.logo },
        revokedReason: link.revokedReason ?? null,
      };
    }

    if (link.expiresAt && link.expiresAt.getTime() <= now.getTime()) {
      return {
        status: "expired" as const,
        group: { code: org.code, name: org.name, logo: org.logo },
        expiresAt: link.expiresAt,
      };
    }

    const existingMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, link.organizationId),
        eq(member.userId, session.user.id),
      ),
    });

    if (existingMembership) {
      return {
        status: "already-member" as const,
        group: { code: org.code, name: org.name, logo: org.logo },
      };
    }

    const usesCount = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(organizationInviteLinkUse)
      .where(eq(organizationInviteLinkUse.inviteLinkId, link.id))
      .then((rows) => rows[0]?.count ?? 0);

    if (link.maxUses && usesCount >= link.maxUses) {
      return {
        status: "max-uses-reached" as const,
        group: { code: org.code, name: org.name, logo: org.logo },
        maxUses: link.maxUses,
        usesCount,
      };
    }

    const membersCount = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(member)
      .where(eq(member.organizationId, link.organizationId))
      .then((rows) => rows[0]?.count ?? 0);

    if (membersCount >= org.maxPlayers) {
      return {
        status: "group-full" as const,
        group: { code: org.code, name: org.name, logo: org.logo },
        maxPlayers: org.maxPlayers,
        membersCount,
      };
    }

    const lastMatch = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.organizationId, link.organizationId),
      columns: { date: true },
      orderBy: [desc(matchesTable.date)],
    });

    const lastActivity = lastMatch?.date
      ? new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
          .format(lastMatch.date)
          .replace(".", "")
      : null;

    return {
      status: "ok" as const,
      group: {
        code: org.code,
        name: org.name,
        logo: org.logo,
        membersCount,
        maxPlayers: org.maxPlayers,
        lastActivity,
      },
      invite: {
        defaultRole: link.defaultRole,
        expiresAt: link.expiresAt ?? null,
        maxUses: link.maxUses ?? null,
        usesCount,
      },
    };
  });

