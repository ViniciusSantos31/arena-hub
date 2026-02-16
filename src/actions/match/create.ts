"use server";

import { createMatchSchema } from "@/app/(protected)/group/[code]/matches/_schema/create";
import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { headers } from "next/headers";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

import { notifyNewMatch } from "@/lib/push-notification";
import { getDateWithTime } from "@/utils/date";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export const createMatch = actionClient
  .inputSchema(
    createMatchSchema.extend({
      organizationCode: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    // Implement the logic to create a match here.

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("User not authenticated");
    }

    const { organizationCode: code, ...data } = parsedInput;

    if (!code) {
      throw new Error("Organization code is required");
    }

    const group = await getOrgIdByCode({
      code,
    });

    if (!group.data) {
      throw new Error("Group not found");
    }

    const organizationId = group.data;

    const dateTime = getDateWithTime(data.date, data.time);
    const dateTimeUTC = dayjs(dateTime).utc().toDate();

    // Here you would typically interact with your database to create the match.
    // For demonstration purposes, we'll just return a mock match object.
    const match = await db
      .insert(matchesTable)
      .values({
        ...data,
        date: dayjs(dateTimeUTC).toDate(),
        time: dayjs(dateTimeUTC).utc().format("HH:mm"),
        organizationId,
      })
      .onConflictDoNothing()
      .returning()
      .then((res) => res[0]);

    // Notificar os usuários do grupo sobre a nova partida.
    if (!match) return;

    // Busca todos os membros do grupo para notificar
    const members = await db.query.member.findMany({
      where: (m, { eq }) => eq(m.organizationId, organizationId),
    });

    // Busca o nome do grupo
    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.id, organizationId),
    });

    if (!organization) return;

    const memberIds = members
      .map((m) => m.userId)
      .filter((id): id is string => !!id);

    const matchDate = dayjs(match.date).format("DD/MM [às] HH[h]mm");

    // Notifica todos os membros sobre a nova partida
    await notifyNewMatch({
      groupName: organization.name,
      matchDate,
      groupId: organizationId,
      matchId: match.id,
      memberIds,
    }).catch(console.error);
  });
