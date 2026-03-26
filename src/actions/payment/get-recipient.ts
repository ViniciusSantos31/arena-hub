"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { paymentRecipientsTable } from "@/db/schema/payment";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const getRecipient = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });

    if (!org) throw new Error("Grupo não encontrado");

    const recipient = await db.query.paymentRecipientsTable.findFirst({
      where: eq(paymentRecipientsTable.organizationId, org.id),
    });

    return recipient ?? null;
  });
