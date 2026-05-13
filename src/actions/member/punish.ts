"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { punishmentTable } from "@/db/schema/punishment";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, eq } from "drizzle-orm";
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

export const punishMember = actionClient
  .inputSchema(
    z.object({
      memberId: z.string().min(1),
      organizationCode: z.string().min(1),
      reason: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { memberId, organizationCode, reason } = parsedInput;

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
      throw new Error("Você não tem permissão para punir membros.");
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

    const targetLevel = roleLevel[targetMember.role ?? "guest"] ?? 0;
    const applierLevel = roleLevel[applierMember.role ?? "guest"] ?? 0;

    if (targetLevel >= applierLevel) {
      throw new Error("Você não pode punir um membro com cargo igual ou superior ao seu.");
    }

    await db.insert(punishmentTable).values({
      memberId,
      organizationId: org.id,
      reason: reason ?? null,
      appliedByUserId: session.user.id,
    });

    const newCount = targetMember.punishmentCount + 1;

    if (newCount >= org.punishmentsToSuspend) {
      const [completedResult] = await db
        .select({ value: count() })
        .from(matchesTable)
        .where(
          and(
            eq(matchesTable.organizationId, org.id),
            eq(matchesTable.status, "completed"),
          ),
        );

      const completedMatchesCount = completedResult?.value ?? 0;

      await db
        .update(member)
        .set({
          punishmentCount: 0,
          suspendedUntilMatchCount:
            completedMatchesCount + org.suspensionMatchCount,
        })
        .where(eq(member.id, memberId));
    } else {
      await db
        .update(member)
        .set({ punishmentCount: newCount })
        .where(eq(member.id, memberId));
    }

    revalidatePath(`/group/${organizationCode}/members`);
  });
