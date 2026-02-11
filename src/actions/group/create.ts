"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod";

export const upsertGroup = actionClient
  .inputSchema(
    z.object({
      id: z.string().optional(),
      name: z
        .string()
        .trim()
        .min(2, "O nome do grupo deve conter pelo menos 2 caracteres")
        .max(100, "O nome do grupo deve conter no máximo 100 caracteres"),
      description: z
        .string()
        .trim()
        .min(10, "A descrição do grupo deve conter pelo menos 10 caracteres")
        .max(500, "A descrição do grupo deve conter no máximo 500 caracteres"),
      image: z.string(),
      isPrivate: z.boolean().optional(),
      maxPlayers: z.number().optional(),
      rules: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const { id, name, description, image, isPrivate, maxPlayers, rules } =
      parsedInput;

    if (id) {
      const orgUpdate = await db
        .update(organization)
        .set({
          name,
          logo: image,
          private: isPrivate ?? false,
          maxPlayers: maxPlayers ?? 10,
          rules,
          metadata: JSON.stringify({ description }),
        })
        .where(eq(organization.id, id))
        .returning();

      if (!orgUpdate) {
        throw new Error("Falha ao atualizar organização");
      }

      revalidatePath("/group", "layout");

      return orgUpdate[0];
    }

    const org = await auth.api.createOrganization({
      body: {
        name,
        userId: session.user.id,
        logo: image,
        private: isPrivate ?? false,
        maxPlayers: maxPlayers ?? 10,
        rules,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        slug:
          name.toLowerCase().replace(/\s+/g, "-") + session.user.id.slice(0, 5),
        metadata: {
          description,
        },
      },
    });

    if (!org) {
      throw new Error("Falha ao criar organização");
    }

    revalidatePath("/", "layout");

    return org;
  });
