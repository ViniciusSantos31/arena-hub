"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export const setAdminGroupPaidMatchesFeature = actionClient
  .inputSchema(
    z.object({
      code: z.string().min(1),
      enabled: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
      throw new Error("Acesso negado");
    }

    const updated = await db
      .update(organization)
      .set({ paidMatchesFeatureEnabled: parsedInput.enabled })
      .where(eq(organization.code, parsedInput.code))
      .returning({ id: organization.id });

    if (updated.length === 0) {
      throw new Error("Grupo não encontrado");
    }

    return { ok: true as const };
  });
