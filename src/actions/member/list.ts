"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { Role } from "@/utils/role";
import { eq } from "drizzle-orm";
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
        },
        orderBy: (member, { desc }) => [desc(member.createdAt)],
      });

      return members.map((member) => ({
        id: member.id,
        image: member.user.image,
        name: member.user.name,
        email: member.user.email,
        score: member.score,
        role: member.role as Role,
        userId: member.userId,
        matches: member.players.reduce(
          (acc, player) => acc + (player.match?.status === "completed" ? 1 : 0),
          0,
        ),
      }));
    }),
);
