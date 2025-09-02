"use server";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod";

export const createGroup = actionClient
  .inputSchema(
    z.object({
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
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const { name, description, image } = parsedInput;

    const org = await auth.api.createOrganization({
      body: {
        name,
        userId: session.user.id,
        logo: image,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        metadata: {
          description,
        },
      },
    });

    return org;
  });
