"use server";

import { db } from "@/db";
import { directInvitesTable } from "@/db/schema/direct-invite";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const declineDirectInvite = actionClient
  .inputSchema(z.object({ inviteId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) throw new Error("Usuário não autenticado");

    const invite = await db.query.directInvitesTable.findFirst({
      where: and(
        eq(directInvitesTable.id, parsedInput.inviteId),
        eq(directInvitesTable.targetUserId, session.user.id),
        eq(directInvitesTable.status, "pending"),
      ),
    });

    if (!invite) throw new Error("Convite não encontrado");

    await db
      .update(directInvitesTable)
      .set({ status: "declined" })
      .where(eq(directInvitesTable.id, invite.id));

    if (invite.inviteLinkId) {
      await db
        .update(organizationInviteLink)
        .set({
          revokedAt: new Date(),
          revokedReason: "Convite recusado pelo destinatário",
          revokedBy: session.user.id,
        })
        .where(eq(organizationInviteLink.id, invite.inviteLinkId));
    }

    return { success: true };
  });
