"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import z from "zod";

export const setAdminGroupPaidMatchesFeature = actionClient
  .inputSchema(
    z.object({
      code: z.string().min(1),
      enabled: z.boolean(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

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
