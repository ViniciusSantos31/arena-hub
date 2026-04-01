"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { memberSubscriptionsTable } from "@/db/schema/memberships";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const getSubscription = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });
    if (!org) return null;

    // Retorna também assinaturas com cancelAtPeriodEnd=true (canceladas mas ainda válidas)
    const sub = await db.query.memberSubscriptionsTable.findFirst({
      where: and(
        eq(memberSubscriptionsTable.userId, session.user.id),
        eq(memberSubscriptionsTable.organizationId, org.id),
        inArray(memberSubscriptionsTable.status, ["active", "trialing", "past_due"]),
      ),
    });

    return sub ?? null;
  });
