"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";
import { getUserMembership } from "../group/membership";

export const kickMember = actionClient
  .inputSchema(
    z.object({
      memberId: z.string().min(1),
      organizationCode: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { memberId, organizationCode } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      throw new Error("Usuário não autenticado.");
    }

    const membership = await getUserMembership({
      organizationCode,
    }).then((res) => res.data);

    if (!membership) {
      throw new Error("Usuário não é membro da organização.");
    }

    const canKickMember = can(membership, ["membership:delete"]);

    if (!canKickMember) {
      throw new Error("Usuário não tem permissão para remover membros.");
    }

    await db
      .delete(member)
      .where(
        and(
          eq(member.id, memberId),
          eq(member.organizationId, membership.organizationId),
        ),
      );
  });
