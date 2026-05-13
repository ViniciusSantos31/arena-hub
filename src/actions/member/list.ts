"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { Role } from "@/utils/role";
import { and, count, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import z from "zod";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const listMembers = cache(
  actionClient
    .inputSchema(
      z.object({
        organizationCode: z.string(),
      }),
    )
    .action(async ({ parsedInput }) => {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.session) {
        throw new Error("Usuário não autenticado");
      }

      const { organizationCode } = parsedInput;

      if (!organizationCode) {
        throw new Error("Organização não encontrada");
      }

      const organization = await getOrgIdByCode({
        code: organizationCode,
      });

      if (!organization?.data) {
        throw new Error("Organização não encontrada");
      }

      const members = await db.query.member.findMany({
        where: eq(member.organizationId, organization.data),
        with: {
          user: {
            columns: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
          players: {
            columns: {
              teamId: true,
            },
            with: {
              match: {
                columns: {
                  id: true,
                  status: true,
                },
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
        },
        orderBy: (member, { desc }) => [desc(member.createdAt)],
      });

      const [completedResult] = await db
        .select({ value: count() })
        .from(matchesTable)
        .where(
          and(
            eq(matchesTable.organizationId, organization.data),
            eq(matchesTable.status, "completed"),
          ),
        );

      const completedMatchesCount = completedResult?.value ?? 0;

      return members.map((member) => ({
        id: member.id,
        image: member.user.image,
        name: member.user.name,
        email: member.user.email,
        score: member.score,
        role: member.role as Role,
        userId: member.userId,
        punishmentCount: member.punishmentCount,
        suspendedUntilMatchCount: member.suspendedUntilMatchCount,
        isSuspended:
          member.suspendedUntilMatchCount > 0 &&
          completedMatchesCount < member.suspendedUntilMatchCount,
        matches: member.players.reduce(
          (acc, player) =>
            acc +
            (player.match?.status === "completed" && player.teamId ? 1 : 0),
          0,
        ),
      }));
    }),
);
