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
      location: z
        .string()
        .trim()
        .max(100, "A localização deve conter no máximo 100 caracteres")
        .optional(),
      lookingForGroup: z.boolean().optional(),
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

    const { name, bio, location, lookingForGroup, image } = parsedInput;

    const updated = await db
      .update(usersTable)
      .set({
        name,
        updatedAt: new Date(),
        ...(bio !== undefined && { bio: bio || null }),
        ...(location !== undefined && { location: location || null }),
        ...(lookingForGroup !== undefined && { lookingForGroup }),
        ...(image && { image }),
      })
      .where(eq(usersTable.id, session.user.id))
      .returning();

    if (!updated[0]) {
      throw new Error("Falha ao atualizar perfil");
    }

    revalidatePath("/profile", "layout");

    return updated[0];
  });
