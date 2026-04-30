"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { Role } from "@/utils/role";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const dashboardRanking = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
      limit: z.number().int().min(1).max(50).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode, limit } = parsedInput;

    const organizationId = await getOrgIdByCode({
      code: organizationCode,
    }).then((org) => org.data);

    if (!organizationId) {
      throw new Error("Organização não encontrada");
    }

    const members = await db.query.member.findMany({
      where: eq(member.organizationId, organizationId),
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
        createdAt: true,
      },
    });

    const ranked = members
      .map((m) => {
        const matches = m.players.reduce(
          (acc, player) =>
            acc +
            (player.match?.status === "completed" && player.teamId ? 1 : 0),
          0,
        );

        return {
          id: m.id,
          userId: m.userId,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
          role: m.role as Role,
          score: m.score,
          matches,
          joinedAt: m.createdAt,
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.matches !== a.matches) return b.matches - a.matches;
        return a.joinedAt.getTime() - b.joinedAt.getTime();
      });

    return (limit ? ranked.slice(0, limit) : ranked).map((item, index) => ({
      ...item,
      position: index + 1,
    }));
  });

