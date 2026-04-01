"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { membershipPlansTable } from "@/db/schema/memberships";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const getMembershipPlan = actionClient
  .inputSchema(z.object({ organizationCode: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autenticado");

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, parsedInput.organizationCode),
    });

    if (!org) throw new Error("Grupo não encontrado");

    const plan = await db.query.membershipPlansTable.findFirst({
      where: and(
        eq(membershipPlansTable.organizationId, org.id),
        eq(membershipPlansTable.isActive, true),
      ),
    });

    return plan ?? null;
  });
