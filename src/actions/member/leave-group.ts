"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";
import { getUserMembership } from "../group/membership";

export const leaveGroup = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { organizationCode } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const membership = await getUserMembership({ organizationCode }).then(
      (res) => res.data,
    );

    if (!membership) {
      throw new Error("Você não é membro deste grupo");
    }

    if (membership.role === "owner") {
      throw new Error(
        "O proprietário não pode sair do grupo. Transfira a propriedade ou exclua o grupo.",
      );
    }

    await db
      .delete(member)
      .where(
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, membership.organizationId),
        ),
      );

    revalidatePath("/home");
    revalidatePath("/group", "layout");

    return { ok: true as const };
  });
