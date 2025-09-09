"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import z from "zod";
import { getOrgIdByCode } from "../group/get-org-by-code";

const roleLevel: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

const requiredLevel = 3;

export const updateMemberRole = actionClient
  .inputSchema(
    z.object({
      memberId: z.string(),
      role: z.enum(["admin", "member", "guest"]),
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { memberId, role, code } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
      throw new Error("Usuário não autenticado", {
        cause: "unauthenticated",
      });
    }
    const response = await getOrgIdByCode({ code });

    if (!response.data) {
      return NextResponse.json(
        { message: "Organização não encontrada" },
        { status: 404 },
      );
    }

    const userMember = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, response.data),
      ),
    });

    if (!userMember) {
      return NextResponse.json(
        { message: "Usuário não é membro de nenhuma organização" },
        { status: 403 },
      );
      throw new Error("Usuário não é membro de nenhuma organização", {
        cause: "forbidden",
      });
    }

    const userRoleLevel = roleLevel[userMember.role ?? "guest"];

    if (userRoleLevel < requiredLevel) {
      return NextResponse.json(
        { message: "Permissão insuficiente" },
        { status: 403 },
      );
      throw new Error("Permissão insuficiente", {
        cause: "forbidden",
      });
    }

    await auth.api
      .updateMemberRole({
        headers: await headers(),
        body: {
          memberId,
          role,
          organizationId: response.data,
        },
      })
      .catch((error) => {
        throw new Error(error.message || "Erro ao atualizar papel do membro", {
          cause: "internal",
        });
      });
  });
