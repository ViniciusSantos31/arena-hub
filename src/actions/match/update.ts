"use server";

import { db } from "@/db";
import { matchesTable, matchStatusEnum } from "@/db/schema/match";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import {
  isNotifiableStatus,
  NotifiableStatus,
  notifyMatchStatusUpdate,
} from "@/lib/push-notification";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";

export const updateMatch = actionClient
  .inputSchema(
    z.object({
      organizationId: z.string(),
      match: z.object({
        id: z.string(),
        title: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        date: z.date().optional(),
        time: z
          .string()
          .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
          .optional(),
        location: z.string().max(200).optional(),
        status: z.enum(matchStatusEnum.enumValues).optional(),
      }),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const membership = await getUserMembership({
      organizationId: parsedInput.organizationId,
    }).then((res) => res.data);

    if (!membership) {
      throw new Error("User is not a member of the organization");
    }

    const canModifyMatch = can(membership, ["match:update", "team:create"]);

    if (!canModifyMatch) {
      throw new Error("User does not have permission to update the match");
    }

    // Busca o estado atual da partida antes de atualizar
    const currentMatch = await db.query.matchesTable.findFirst({
      where: (m, { eq }) => eq(m.id, parsedInput.match.id),
    });

    await db
      .update(matchesTable)
      .set({
        ...parsedInput.match,
      })
      .where(eq(matchesTable.id, parsedInput.match.id));

    // Só notifica se o status mudou e é um status notificável
    const newStatus = parsedInput.match.status as NotifiableStatus;
    if (
      !newStatus ||
      !isNotifiableStatus(newStatus) ||
      currentMatch?.status === newStatus
    ) {
      return;
    }

    // Busca participantes e dados do grupo para a notificação
    const [players, organization] = await Promise.all([
      db.query.playersTable.findMany({
        where: (p, { eq }) => eq(p.matchId, parsedInput.match.id),
      }),
      db.query.organization.findFirst({
        where: (org, { eq }) => eq(org.id, parsedInput.organizationId),
      }),
    ]);

    if (!organization || !currentMatch) return;

    const participantIds = players
      .map((p) => p.userId)
      .filter((id): id is string => !!id);

    if (participantIds.length === 0) return;

    const matchDate = dayjs(currentMatch.date).format("DD/MM [às] HH[h]mm");

    await notifyMatchStatusUpdate({
      groupName: organization.name,
      matchDate,
      newStatus,
      groupCode: organization.code,
      matchId: parsedInput.match.id,
      participantIds,
    }).catch(console.error);
  });
