"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { requestsTable } from "@/db/schema/request";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const getJoinRequestsCount = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return 0;

    const { organizationCode } = parsedInput;

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, organizationCode),
      columns: { id: true },
    });

    if (!org) return 0;

    const myMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, org.id),
        eq(member.userId, session.user.id),
      ),
    });

    if (!myMembership || !can(myMembership, ["membership:approve"])) return 0;

    const count = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(requestsTable)
      .where(
        and(
          eq(requestsTable.organizationId, org.id),
          eq(requestsTable.status, "pending"),
        ),
      )
      .then((rows) => rows[0]?.count ?? 0);

    return count;
  });
