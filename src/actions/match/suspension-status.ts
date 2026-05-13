"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";

export const getUserSuspensionStatus = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
      matchId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { organizationCode, matchId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { isSuspended: false };
    }

    const membership = await getUserMembership({ organizationCode }).then(
      (res) => res.data,
    );

    if (!membership || membership.suspendedUntilMatchCount === 0) {
      return { isSuspended: false };
    }

    const match = await db.query.matchesTable.findFirst({
      where: eq(matchesTable.id, matchId),
      columns: { organizationId: true },
    });

    if (!match?.organizationId) {
      return { isSuspended: false };
    }

    const [completedResult] = await db
      .select({ value: count() })
      .from(matchesTable)
      .where(
        and(
          eq(matchesTable.organizationId, match.organizationId),
          eq(matchesTable.status, "completed"),
        ),
      );

    const completedMatchesCount = completedResult?.value ?? 0;
    const isSuspended =
      completedMatchesCount < membership.suspendedUntilMatchCount;

    if (!isSuspended) {
      await db
        .update(member)
        .set({ suspendedUntilMatchCount: 0 })
        .where(eq(member.id, membership.id));
    }

    const remainingMatches = isSuspended
      ? membership.suspendedUntilMatchCount - completedMatchesCount
      : 0;

    return { isSuspended, remainingMatches };
  });
