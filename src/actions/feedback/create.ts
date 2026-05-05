"use server";

import { db } from "@/db";
import { feedbackTable } from "@/db/schema/feedback";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod";

export const createFeedback = actionClient
  .inputSchema(
    z.object({
      rating: z
        .number()
        .int()
        .min(1, "Selecione uma avaliação de 1 a 5")
        .max(5, "Selecione uma avaliação de 1 a 5"),
      message: z
        .string()
        .trim()
        .min(10, "Conte um pouco mais (mínimo 10 caracteres)")
        .max(1000, "O feedback deve conter no máximo 1000 caracteres"),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const inserted = await db
      .insert(feedbackTable)
      .values({
        userId: session.user.id,
        userNameSnapshot: session.user.name,
        userImageSnapshot: session.user.image ?? null,
        rating: parsedInput.rating,
        message: parsedInput.message,
      })
      .returning()
      .then((res) => res[0]);

    if (!inserted) {
      throw new Error("Falha ao salvar feedback");
    }

    return inserted;
  });

