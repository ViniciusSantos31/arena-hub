"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { can } from "@/hooks/use-guard";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";

export const deleteMatch = actionClient
  .inputSchema(
    z.object({
      matchId: z.string(),
      organizationId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { matchId } = parsedInput;

    const membership = await getUserMembership({
      organizationId: parsedInput.organizationId,
    }).then((res) => res.data);

    if (!membership) {
      throw new Error("User is not a member of the organization");
    }

    const useCanDeleteMatch = can(membership, ["match:delete"]);

    if (!useCanDeleteMatch) {
      throw new Error("User does not have permission to delete matches");
    }

    await db.delete(matchesTable).where(eq(matchesTable.id, matchId));
  });
