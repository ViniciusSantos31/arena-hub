"use server";

import { db } from "@/db";
import { requestsTable } from "@/db/schema/request";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { notifyNewJoinRequest } from "@/lib/push-notification";
import { headers } from "next/headers";
import z from "zod/v4";

export const createJoinRequest = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { organizationCode } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !session.session) {
      throw new Error("Usuário não autenticado");
    }

    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.code, organizationCode),
    });

    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    const existingRequest = await db.query.requestsTable.findFirst({
      where: (req, { and, eq }) =>
        and(
          eq(req.organizationId, organization.id),
          eq(req.userId, session.user.id),
        ),
    });

    const { maxPlayers } = organization;
    const orgMembers = await db.query.member
      .findMany({
        where: (m, { eq }) => eq(m.organizationId, organization.id),
      })
      .then((members) => members);

    if (orgMembers.length >= maxPlayers) {
      throw new Error("A organização atingiu o número máximo de membros");
    }

    await db
      .insert(requestsTable)
      .values({
        id: existingRequest ? existingRequest.id : undefined,
        organizationId: organization.id,
        userId: session.user.id,
      })
      .onConflictDoUpdate({
        target: [requestsTable.id],
        set: {
          status: "pending",
        },
      });

    // Busca somente moderadores e owner para notificar
    const moderatorIds = orgMembers
      .filter((m) => m.role === "owner" || m.role === "admin")
      .map((m) => m.userId)
      .filter((id): id is string => !!id)
      // Não notifica o próprio usuário que fez a solicitação
      .filter((id) => id !== session.user.id);

    if (moderatorIds.length === 0) return;

    await notifyNewJoinRequest({
      groupName: organization.name,
      requesterName: session.user.name ?? "Alguém",
      groupId: organization.id,
      moderatorIds,
    }).catch(console.error);
  });
