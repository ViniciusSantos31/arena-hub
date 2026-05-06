"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const revokeInviteLink = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
      inviteLinkId: z.string().min(1),
      reason: z.string().trim().min(1).max(120).optional(),
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
      where: and(eq(member.organizationId, org.id), eq(member.userId, session.user.id)),
    });

    const canManageInvites =
      myMembership?.role === "owner" || myMembership?.role === "admin";

    if (!canManageInvites) {
      throw new Error("Sem permissão para revogar links de convite");
    }

    const existing = await db.query.organizationInviteLink.findFirst({
      where: and(
        eq(organizationInviteLink.id, parsedInput.inviteLinkId),
        eq(organizationInviteLink.organizationId, org.id),
      ),
    });

    if (!existing) {
      throw new Error("Link de convite não encontrado");
    }

    if (existing.revokedAt) {
      return { revokedAt: existing.revokedAt };
    }

    const now = new Date();

    const updated = await db
      .update(organizationInviteLink)
      .set({
        revokedAt: now,
        revokedBy: session.user.id,
        revokedReason: parsedInput.reason,
        updatedAt: now,
      })
      .where(eq(organizationInviteLink.id, existing.id))
      .returning()
      .then((rows) => rows[0]);

    if (!updated?.revokedAt) {
      throw new Error("Falha ao revogar link de convite");
    }

    return { revokedAt: updated.revokedAt };
  });

