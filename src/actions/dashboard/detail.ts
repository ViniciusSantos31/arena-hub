"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { headers } from "next/headers";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const dashboardDetails = actionClient
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

    if (!session?.session || !session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const organizationId = await getOrgIdByCode({
      code: organizationCode,
    }).then((org) => {
      return org.data;
    });

    if (!organizationId) {
      throw new Error("Organização não encontrada");
    }

    const lastMonthStart = dayjs()
      .subtract(1, "month")
      .startOf("month")
      .toDate();
    const lastMonthEnd = dayjs().subtract(1, "month").endOf("month").toDate();

    const actualMonthStart = dayjs().startOf("month").toDate();
    const actualMonthEnd = dayjs().endOf("month").toDate();

    const [
      lastMonthMatchesCount,
      actualMonthMatchesCount,
      matchesCount,
      membersCount,
    ] = await Promise.all([
      await db.query.matchesTable
        .findMany({
          where: (matchesTable, { eq, and, gte, lte }) =>
            and(
              eq(matchesTable.organizationId, organizationId),
              gte(matchesTable.createdAt, lastMonthStart),
              lte(matchesTable.createdAt, lastMonthEnd),
            ),
        })
        .then((matches) => matches.length),
      await db.query.matchesTable
        .findMany({
          where: (matchesTable, { eq, and, gte, lte }) =>
            and(
              eq(matchesTable.organizationId, organizationId),
              gte(matchesTable.createdAt, actualMonthStart),
              lte(matchesTable.createdAt, actualMonthEnd),
            ),
        })
        .then((matches) => matches.length),
      await db.query.matchesTable
        .findMany({
          where: (matchesTable, { eq }) =>
            eq(matchesTable.organizationId, organizationId),
        })
        .then((matches) => matches.length),
      await db.query.member
        .findMany({
          where: (member, { eq }) => eq(member.organizationId, organizationId),
        })
        .then((members) => members.length),
    ]);

    const matchesCountDifference =
      actualMonthMatchesCount - lastMonthMatchesCount;

    const matchesPercentageRate =
      lastMonthMatchesCount === 0
        ? actualMonthMatchesCount === 0
          ? 0
          : 100
        : (matchesCountDifference / lastMonthMatchesCount) * 100;

    return {
      matchesCount,
      lastMonthMatchesCount,
      actualMonthMatchesCount,
      matchesPercentageRate,
      membersCount,
    };
  });
