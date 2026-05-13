"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod/v4";

const roleLevel: Record<string, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

const requiredLevel = 3;

export const removePunishment = actionClient
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

    if (!session?.user) {
      throw new Error("Usuário não autenticado.");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, organizationCode),
    });

    if (!org) {
      throw new Error("Organização não encontrada.");
    }

    const applierMember = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, org.id),
      ),
    });

    if (!applierMember) {
      throw new Error("Você não é membro desta organização.");
    }

    if ((roleLevel[applierMember.role ?? "guest"] ?? 0) < requiredLevel) {
      throw new Error("Você não tem permissão para remover punições.");
    }

    const targetMember = await db.query.member.findFirst({
      where: and(
        eq(member.id, memberId),
        eq(member.organizationId, org.id),
      ),
    });

    if (!targetMember) {
      throw new Error("Membro não encontrado.");
    }

    const newCount = Math.max(0, targetMember.punishmentCount - 1);

    await db
      .update(member)
      .set({
        punishmentCount: newCount,
        suspendedUntilMatchCount: 0,
      })
      .where(eq(member.id, memberId));

    revalidatePath(`/group/${organizationCode}/members`);
  });
