"use server";

import { db } from "@/db";
import { feedbackTable } from "@/db/schema/feedback";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

function assertAdmin(userEmail?: string | null) {
  if (!userEmail || userEmail !== process.env.ADMIN_EMAIL) {
    throw new Error("Acesso negado");
  }
}

export const adminListFeedbacks = actionClient
  .inputSchema(
    z.object({
      status: z.enum(["pending", "approved"]).default("pending"),
      limit: z.number().int().min(1).max(200).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      throw new Error("Usuário não autenticado");
    }

    assertAdmin(session.user.email);

    const isApproved = parsedInput.status === "approved";
    const limit = parsedInput.limit ?? 50;

    return db.query.feedbackTable.findMany({
      where: eq(feedbackTable.isApproved, isApproved),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
      limit,
      columns: {
        id: true,
        userId: true,
        userNameSnapshot: true,
        userImageSnapshot: true,
        rating: true,
        message: true,
        isApproved: true,
        createdAt: true,
      },
    });
  });

export const adminSetFeedbackApproval = actionClient
  .inputSchema(
    z.object({
      id: z.string().min(1),
      isApproved: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      throw new Error("Usuário não autenticado");
    }

    assertAdmin(session.user.email);

    const updated = await db
      .update(feedbackTable)
      .set({ isApproved: parsedInput.isApproved })
      .where(eq(feedbackTable.id, parsedInput.id))
      .returning()
      .then((res) => res[0]);

    if (!updated) {
      throw new Error("Feedback não encontrado");
    }

    return updated;
  });

export const adminDeleteFeedback = actionClient
  .inputSchema(
    z.object({
      id: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session?.user) {
      throw new Error("Usuário não autenticado");
    }

    assertAdmin(session.user.email);

    const deleted = await db
      .delete(feedbackTable)
      .where(eq(feedbackTable.id, parsedInput.id))
      .returning({ id: feedbackTable.id })
      .then((res) => res[0]);

    if (!deleted) {
      throw new Error("Feedback não encontrado");
    }

    return deleted;
  });

