"use server";

import { db } from "@/db";
import { organization, sessionsTable } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export const deleteGroup = actionClient
  .inputSchema(
    z.object({
      code: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.code),
    });

    if (!org) {
      throw new Error("Grupo não encontrado");
    }

    const membership = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, org.id),
      ),
    });

    if (!membership || membership.role !== "owner") {
      throw new Error("Apenas o proprietário pode excluir o grupo");
    }

    await db
      .update(sessionsTable)
      .set({ activeOrganizationId: null })
      .where(eq(sessionsTable.activeOrganizationId, org.id));

    await db.delete(organization).where(eq(organization.id, org.id));

    revalidatePath("/", "layout");
    revalidatePath("/group", "layout");
    revalidatePath("/home");

    return { ok: true as const };
  });
