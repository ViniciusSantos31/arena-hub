"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import { getOrgIdByCode } from "../group/get-org-by-code";

const roleLevel: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

const requiredLevel = 3;

export const updateMemberScore = actionClient
  .inputSchema(
    z.object({
      memberId: z.string(),
      score: z.number().min(0).max(50).optional(),
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { memberId, score, code } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado", {
        cause: "unauthenticated",
      });
    }
    const response = await getOrgIdByCode({ code });

    if (!response.data) {
      throw new Error("Organização não encontrada", {
        cause: "not_found",
      });
    }

    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, response.data),
      ),
    });

    if (!userMember) {
      throw new Error("Usuário não é membro de nenhuma organização", {
        cause: "forbidden",
      });
    }

    const userRoleLevel = roleLevel[userMember.role ?? "guest"];

    if (userRoleLevel < requiredLevel) {
      throw new Error("Permissão insuficiente", {
        cause: "forbidden",
      });
    }

    await db
      .update(member)
      .set({ score: score ?? 0 })
      .where(eq(member.id, memberId));
  });
