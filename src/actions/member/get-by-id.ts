"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { Role } from "@/utils/role";
import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const getMemberById = actionClient
  .inputSchema(
    z.object({
      memberId: z.string(),
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { memberId, organizationCode } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const result = await db.query.member.findFirst({
      where: eq(member.id, memberId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        players: {
          columns: { teamId: true },
          with: {
            match: {
              columns: { id: true, status: true },
            },
          },
        },
      },
      columns: {
        id: true,
        score: true,
        role: true,
        userId: true,
        punishmentCount: true,
        suspendedUntilMatchCount: true,
        organizationId: true,
      },
    });

    if (!result) {
      throw new Error("Membro não encontrado");
    }

    const [completedResult] = await db
      .select({ value: count() })
      .from(matchesTable)
      .where(
        and(
          eq(matchesTable.organizationId, result.organizationId),
          eq(matchesTable.status, "completed"),
        ),
      );

    const completedMatchesCount = completedResult?.value ?? 0;

    return {
      id: result.id,
      userId: result.userId,
      name: result.user?.name,
      email: result.user?.email,
      image: result.user?.image ?? null,
      role: result.role as Role,
      score: result.score,
      punishmentCount: result.punishmentCount,
      suspendedUntilMatchCount: result.suspendedUntilMatchCount,
      isSuspended:
        result.suspendedUntilMatchCount > 0 &&
        completedMatchesCount < result.suspendedUntilMatchCount,
      matches: result.players.reduce(
        (acc, p) =>
          acc + (p.match?.status === "completed" && p.teamId ? 1 : 0),
        0,
      ),
      organizationCode,
    };
  });
