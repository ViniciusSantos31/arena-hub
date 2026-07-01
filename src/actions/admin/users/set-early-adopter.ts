"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import z from "zod";

export const setAdminUserEarlyAdopter = actionClient
  .inputSchema(
    z.object({
      userId: z.string().min(1),
      isEarlyAdopter: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const updated = await db
      .update(usersTable)
      .set({
        isEarlyAdopter: parsedInput.isEarlyAdopter,
        earlyAdopterGrantedAt: parsedInput.isEarlyAdopter ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, parsedInput.userId))
      .returning({ id: usersTable.id })
      .then((rows) => rows[0]);

    if (!updated) {
      throw new Error("Usuário não encontrado");
    }

    return { success: true };
  });
