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

import { getDateWithTime } from "@/utils/date";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";

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
    await db
      .insert(matchesTable)
      .values({
        ...data,
        date: dayjs(dateTimeUTC).toDate(),
        time: dayjs(dateTimeUTC).format("HH:mm"),
        organizationId,
      })
      .onConflictDoNothing();

    revalidatePath(`/group/${code}/matches`);
  });
