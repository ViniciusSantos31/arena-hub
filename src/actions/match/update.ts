"use server";

import { db } from "@/db";
import { matchesTable, matchStatusEnum } from "@/db/schema/match";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
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

    await db
      .update(matchesTable)
      .set({
        ...parsedInput.match,
      })
      .where(eq(matchesTable.id, parsedInput.match.id));
  });
