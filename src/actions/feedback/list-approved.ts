"use server";

import { db } from "@/db";
import { feedbackTable } from "@/db/schema/feedback";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import z from "zod";

export const listApprovedFeedbacks = actionClient
  .inputSchema(
    z.object({
      limit: z.number().int().min(1).max(50).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const limit = parsedInput.limit ?? 10;

    const rows = await db.query.feedbackTable.findMany({
      where: eq(feedbackTable.isApproved, true),
      orderBy: (f, { desc }) => [desc(f.createdAt)],
      limit,
      columns: {
        id: true,
        userNameSnapshot: true,
        userImageSnapshot: true,
        rating: true,
        message: true,
        createdAt: true,
      },
    });

    return rows;
  });

