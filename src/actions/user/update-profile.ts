"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export const updateProfile = actionClient
  .inputSchema(
    z.object({
      name: z
        .string()
        .trim()
        .min(2, "O nome deve conter pelo menos 2 caracteres")
        .max(100, "O nome deve conter no máximo 100 caracteres"),
      bio: z
        .string()
        .trim()
        .max(300, "A bio deve conter no máximo 300 caracteres")
        .optional(),
      image: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { name, bio, image } = parsedInput;

    const updated = await db
      .update(usersTable)
      .set({
        name,
        updatedAt: new Date(),
        ...(bio !== undefined && { bio: bio || null }),
        ...(image && { image }),
      })
      .where(eq(usersTable.id, session.user.id))
      .returning();

    if (!updated[0]) {
      throw new Error("Falha ao atualizar perfil");
    }

    revalidatePath("/profile");

    return updated[0];
  });
