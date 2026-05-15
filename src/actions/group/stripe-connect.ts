"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export const getStripeConnectStatus = actionClient
  .inputSchema(z.object({ organizationId: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.id, parsedInput.organizationId),
      columns: { stripeAccountId: true },
    });

    return {
      stripeAccountId: org?.stripeAccountId ?? null,
    };
  });

export const saveStripeAccountId = actionClient
  .inputSchema(
    z.object({ organizationId: z.string(), stripeAccountId: z.string() }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    await db
      .update(organization)
      .set({ stripeAccountId: parsedInput.stripeAccountId })
      .where(eq(organization.id, parsedInput.organizationId));

    return { success: true };
  });
