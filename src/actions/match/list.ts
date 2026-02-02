"use server";

import { db } from "@/db";
import { matchesTable, matchStatusEnum } from "@/db/schema/match";
import { actionClient } from "@/lib/next-safe-action";
import { fromUTCDate } from "@/utils/date";
import dayjs from "dayjs";
import { gte, ne, Operators } from "drizzle-orm";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const listMatches = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
      filters: z
        .object({
          sport: z.string().optional(),
          status: z.array(z.enum(matchStatusEnum.enumValues)).optional(),
          dateRange: z
            .object({
              dateFrom: z.date().optional(),
              dateTo: z.date().optional(),
            })
            .optional(),
        })
        .optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { code } = parsedInput;
    const organizationId = await getOrgIdByCode({ code }).then(
      (res) => res.data,
    );

    if (!organizationId) {
      throw new Error("Group not found");
    }

    const buildFilters = (table: typeof matchesTable, operators: Operators) => {
      const { eq, and, gte, lte, inArray } = operators;

      const filters = [eq(table.organizationId, organizationId)];

      if (parsedInput.filters?.sport) {
        filters.push(eq(table.sport, parsedInput.filters.sport));
      }

      if (parsedInput.filters?.status) {
        filters.push(inArray(table.status, parsedInput.filters.status));
      }

      if (parsedInput.filters?.dateRange) {
        if (parsedInput.filters.dateRange.dateFrom) {
          const isToday = dayjs(parsedInput.filters.dateRange.dateFrom).isSame(
            dayjs(),
            "day",
          );
          const dateFrom = isToday
            ? dayjs().toDate()
            : dayjs(parsedInput.filters.dateRange.dateFrom)
                .startOf("day")
                .toDate();
          filters.push(gte(table.date, dateFrom));
        }
        if (parsedInput.filters.dateRange.dateTo) {
          const dateTo = dayjs(parsedInput.filters.dateRange.dateTo)
            .endOf("day")
            .toDate();
          filters.push(lte(table.date, dateTo));
        }
      }

      return filters.length > 0 ? and(...filters) : undefined;
    };

    const response = await db.query.matchesTable.findMany({
      where: (_, operators) => buildFilters(matchesTable, operators),
      orderBy: (matchesTable, { desc }) => [desc(matchesTable.date)],
      with: {
        players: {
          with: {
            user: {
              columns: {
                id: true,
                image: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return response.map((match) => ({
      ...match,
      date: fromUTCDate(match.date),
      players: match.players?.map((player) => player.user ?? undefined) ?? [],
    }));
  });

export const listNextMatch = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { code } = parsedInput;
    const organizationId = await getOrgIdByCode({ code }).then(
      (res) => res.data,
    );

    if (!organizationId) {
      throw new Error("Group not found");
    }

    const response = await db.query.matchesTable.findFirst({
      where: (matchesTable, { eq, and }) =>
        and(
          eq(matchesTable.organizationId, organizationId),
          ne(matchesTable.status, "completed"),
          ne(matchesTable.status, "cancelled"),
          gte(matchesTable.date, dayjs().toDate()),
        ),
      orderBy: (matchesTable, { asc }) => [asc(matchesTable.date)],
      with: {
        players: {
          with: {
            user: {
              columns: {
                id: true,
                image: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!response) {
      return null;
    }

    return {
      ...response,
      date: fromUTCDate(response.date),
      players: response.players.map((player) => player.user ?? undefined) ?? [],
    };
  });

export const matchDetails = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const response = await db.query.matchesTable.findFirst({
      where: (matchesTable, { eq }) => eq(matchesTable.id, matchId),
      with: {
        players: {
          with: {
            user: {
              columns: {
                id: true,
                image: true,
                name: true,
              },
            },
            member: {
              columns: {
                score: true,
              },
            },
          },
        },
      },
    });

    if (!response) {
      throw new Error("Match not found");
    }

    return {
      ...response,
      date: fromUTCDate(response.date),
    };
  });
