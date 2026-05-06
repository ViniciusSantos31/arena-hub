"use server";

import { db } from "@/db";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";

export const deleteInviteLink = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
      inviteLinkId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode, inviteLinkId } = parsedInput;

    const inviteLink = await db.query.organizationInviteLink.findFirst({
      where: (inviteLink, { eq }) => eq(inviteLink.id, inviteLinkId),
    });

    if (!inviteLink) {
      throw new Error("Link de convite não encontrado");
    }

    const membership = await getUserMembership({
      organizationCode,
    }).then((res) => res.data);

    if (!membership) {
      throw new Error("Usuário não é membro da organização");
    }

    await db
      .delete(organizationInviteLink)
      .where(eq(organizationInviteLink.id, inviteLinkId));
  });
