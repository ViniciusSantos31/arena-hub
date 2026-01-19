"use server";

import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";
import { fromUTCDate } from "@/utils/date";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const listMatches = actionClient
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

    const response = await db.query.matchesTable.findMany({
      where: (matchesTable, { eq }) =>
        eq(matchesTable.organizationId, organizationId),
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
      where: (matchesTable, { eq }) =>
        eq(matchesTable.organizationId, organizationId),
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
      matchId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const response = await db.query.matchesTable.findFirst({
      where: (matchesTable, { eq }) => eq(matchesTable.id, matchId),
      with: {
        players: {
          columns: {
            score: true,
          },
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
      throw new Error("Match not found");
    }

    return {
      ...response,
      date: fromUTCDate(response.date),
    };
  });
