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
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { hashInviteToken } from "./_utils";

export const consumeInviteLink = actionClient
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
      throw new Error("Link inválido ou não encontrado");
    }

    if (link.revokedAt) {
      throw new Error("Este link foi revogado");
    }

    const now = new Date();
    if (link.expiresAt && link.expiresAt.getTime() <= now.getTime()) {
      throw new Error("Este link expirou");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.id, link.organizationId),
    });

    if (!org) {
      throw new Error("Grupo não encontrado");
    }

    if (!org.private) {
      throw new Error("Este link só pode ser usado em grupos privados");
    }

    const existingMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, link.organizationId),
        eq(member.userId, session.user.id),
      ),
    });

    if (existingMembership) {
      return { organizationCode: org.code, alreadyMember: true };
    }

    if (link.maxUses) {
      const usesCount = await db
        .select({
          count: sql<number>`count(*)`.mapWith(Number),
        })
        .from(organizationInviteLinkUse)
        .where(eq(organizationInviteLinkUse.inviteLinkId, link.id))
        .then((rows) => rows[0]?.count ?? 0);

      if (usesCount >= link.maxUses) {
        throw new Error("Este link atingiu o limite de usos");
      }
    }

    const membersCount = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(member)
      .where(eq(member.organizationId, link.organizationId))
      .then((rows) => rows[0]?.count ?? 0);

    if (membersCount >= org.maxPlayers) {
      throw new Error("O grupo atingiu o número máximo de membros");
    }

    await auth.api.addMember({
      headers: await headers(),
      body: {
        role: link.defaultRole ?? "guest",
        organizationId: link.organizationId,
        userId: session.user.id,
        score: 25,
      },
    });

    await db.insert(organizationInviteLinkUse).values({
      inviteLinkId: link.id,
      usedByUserId: session.user.id,
    });

    return { organizationCode: org.code, alreadyMember: false };
  });
