"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { directInvitesTable } from "@/db/schema/direct-invite";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { usersTable } from "@/db/schema/user";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import {
  encryptInviteToken,
  generateInviteToken,
  hashInviteToken,
} from "./_utils";

export const sendDirectInvite = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
      targetUserId: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode, targetUserId } = parsedInput;

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, organizationCode),
    });

    if (!org) throw new Error("Grupo não encontrado");

    const myMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, org.id),
        eq(member.userId, session.user.id),
      ),
    });

    if (!myMembership || !can(myMembership, ["group:links"])) {
      throw new Error("Sem permissão para enviar convites");
    }

    const targetUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, targetUserId),
      columns: { id: true, name: true },
    });

    if (!targetUser) throw new Error("Usuário não encontrado");

    const alreadyMember = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, org.id),
        eq(member.userId, targetUserId),
      ),
    });

    if (alreadyMember) throw new Error("Jogador já é membro do grupo");

    const existingInvite = await db.query.directInvitesTable.findFirst({
      where: and(
        eq(directInvitesTable.organizationId, org.id),
        eq(directInvitesTable.targetUserId, targetUserId),
        eq(directInvitesTable.status, "pending"),
      ),
    });

    if (existingInvite) {
      await db
        .update(directInvitesTable)
        .set({
          status: "pending",
        })
        .where(eq(directInvitesTable.id, existingInvite.id));
      return { success: true };
    }

    const token = generateInviteToken();
    const tokenHash = hashInviteToken(token);
    const encrypted = encryptInviteToken(token);

    const [inviteLink] = await db
      .insert(organizationInviteLink)
      .values({
        organizationId: org.id,
        label: `Vitrine — ${targetUser.name}`,
        tokenHash,
        ...encrypted,
        defaultRole: "guest",
        maxUses: 1,
        createdBy: session.user.id,
      })
      .returning();

    await db.insert(directInvitesTable).values({
      inviteLinkId: inviteLink.id,
      organizationId: org.id,
      targetUserId,
      sentByUserId: session.user.id,
    });

    return { success: true };
  });
