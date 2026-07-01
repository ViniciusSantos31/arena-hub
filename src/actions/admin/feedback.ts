"use server";

import { db } from "@/db";
import { feedbackTable } from "@/db/schema/feedback";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import z from "zod";

export const adminListFeedbacks = actionClient
  .inputSchema(
    z.object({
      status: z.enum(["pending", "approved"]).default("pending"),
      limit: z.number().int().min(1).max(200).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

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
    await assertAdmin();

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
    await assertAdmin();

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
