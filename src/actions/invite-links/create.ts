"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import {
  encryptInviteToken,
  generateInviteToken,
  getRequestBaseUrl,
  hashInviteToken,
} from "./_utils";

export const createInviteLink = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
      label: z.string().trim().min(1).max(80).optional(),
      defaultRole: z.enum(["guest", "member"]).default("guest"),
      expiresAt: z.coerce.date().optional(),
      maxUses: z.number().int().min(1).max(1000).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode, label, defaultRole, expiresAt, maxUses } =
      parsedInput;

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, organizationCode),
    });

    if (!org) {
      throw new Error("Grupo não encontrado");
    }

    if (!org.private) {
      throw new Error(
        "Links de convite só podem ser criados em grupos privados",
      );
    }

    const myMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, org.id),
        eq(member.userId, session.user.id),
      ),
    });

    if (!myMembership) {
      throw new Error("Usuário não é membro do grupo");
    }
    const canCreateInvite = can(myMembership, ["group:links"]);

    if (!canCreateInvite) {
      throw new Error("Sem permissão para criar links de convite");
    }

    const token = generateInviteToken();
    const tokenHash = hashInviteToken(token);
    const encrypted = encryptInviteToken(token);

    const created = await db
      .insert(organizationInviteLink)
      .values({
        organizationId: org.id,
        label,
        tokenHash,
        ...encrypted,
        defaultRole,
        expiresAt,
        maxUses,
        createdBy: session.user.id,
      })
      .returning()
      .then((rows) => rows[0]);

    if (!created) {
      throw new Error("Falha ao criar link de convite");
    }

    const path = `/invite/${token}`;
    const baseUrl = await getRequestBaseUrl();

    return {
      inviteLink: {
        id: created.id,
        label: created.label,
        defaultRole: created.defaultRole,
        expiresAt: created.expiresAt,
        maxUses: created.maxUses,
        revokedAt: created.revokedAt,
        createdAt: created.createdAt,
      },
      invitePath: path,
      inviteUrl: baseUrl ? `${baseUrl}${path}` : null,
    };
  });
