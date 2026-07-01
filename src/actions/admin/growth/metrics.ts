"use server";

import { db } from "@/db";
import { accountsTable } from "@/db/schema/auth";
import { directInvitesTable } from "@/db/schema/direct-invite";
import {
  organizationInviteLink,
  organizationInviteLinkUse,
} from "@/db/schema/invite-link";
import { requestsTable } from "@/db/schema/request";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { and, eq, gte, isNotNull, lte, sql } from "drizzle-orm";
import z from "zod";

export interface AdminGrowthMetricsData {
  period: { start: string; end: string };
  inviteLinks: {
    created: number;
    revoked: number;
    consumed: number;
    conversionRate: number;
  };
  directInvitesSent: number;
  joinRequests: {
    submitted: number;
    approved: number;
    rejected: number;
  };
  lfgActiveUsers: number;
  newUsersByProvider: Record<string, number>;
}

function requestTimestamp(
  column: typeof requestsTable.createdAt | typeof requestsTable.updatedAt,
) {
  return sql`${column}::timestamptz`;
}

export const adminGrowthMetrics = actionClient
  .inputSchema(
    z.object({
      days: z.union([z.literal(7), z.literal(30), z.literal(90)]).optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const days = parsedInput.days ?? 30;
    const periodEnd = dayjs().endOf("day").toDate();
    const periodStart = dayjs()
      .subtract(days - 1, "day")
      .startOf("day")
      .toDate();

    const inviteLinkDateFilter = and(
      gte(organizationInviteLink.createdAt, periodStart),
      lte(organizationInviteLink.createdAt, periodEnd),
    );

    const [
      inviteLinksCreatedRow,
      inviteLinksRevokedRow,
      inviteLinksConsumedRow,
      directInvitesSentRow,
      joinRequestsSubmittedRow,
      joinRequestsApprovedRow,
      joinRequestsRejectedRow,
      lfgActiveUsersRow,
      newUsersByProviderRows,
    ] = await Promise.all([
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(organizationInviteLink)
        .where(inviteLinkDateFilter),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(organizationInviteLink)
        .where(
          and(
            isNotNull(organizationInviteLink.revokedAt),
            gte(organizationInviteLink.revokedAt, periodStart),
            lte(organizationInviteLink.revokedAt, periodEnd),
          ),
        ),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(organizationInviteLinkUse)
        .where(
          and(
            gte(organizationInviteLinkUse.usedAt, periodStart),
            lte(organizationInviteLinkUse.usedAt, periodEnd),
          ),
        ),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(directInvitesTable)
        .where(
          and(
            gte(directInvitesTable.createdAt, periodStart),
            lte(directInvitesTable.createdAt, periodEnd),
          ),
        ),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(requestsTable)
        .where(
          and(
            gte(requestTimestamp(requestsTable.createdAt), periodStart),
            lte(requestTimestamp(requestsTable.createdAt), periodEnd),
          ),
        ),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(requestsTable)
        .where(
          and(
            eq(requestsTable.status, "approved"),
            gte(requestTimestamp(requestsTable.updatedAt), periodStart),
            lte(requestTimestamp(requestsTable.updatedAt), periodEnd),
          ),
        ),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(requestsTable)
        .where(
          and(
            eq(requestsTable.status, "rejected"),
            gte(requestTimestamp(requestsTable.updatedAt), periodStart),
            lte(requestTimestamp(requestsTable.updatedAt), periodEnd),
          ),
        ),
      db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(usersTable)
        .where(eq(usersTable.lookingForGroup, true)),
      db
        .select({
          providerId: accountsTable.providerId,
          count: sql<number>`COUNT(DISTINCT ${usersTable.id})::int`,
        })
        .from(usersTable)
        .innerJoin(accountsTable, eq(accountsTable.userId, usersTable.id))
        .where(
          and(
            gte(usersTable.createdAt, periodStart),
            lte(usersTable.createdAt, periodEnd),
          ),
        )
        .groupBy(accountsTable.providerId),
    ]);

    const created = Number(inviteLinksCreatedRow[0]?.count ?? 0);
    const consumed = Number(inviteLinksConsumedRow[0]?.count ?? 0);
    const conversionRate =
      created === 0 ? 0 : Math.round((consumed / created) * 1000) / 10;

    const newUsersByProvider: Record<string, number> = {};
    for (const row of newUsersByProviderRows) {
      newUsersByProvider[row.providerId] = Number(row.count ?? 0);
    }

    const data: AdminGrowthMetricsData = {
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      inviteLinks: {
        created,
        revoked: Number(inviteLinksRevokedRow[0]?.count ?? 0),
        consumed,
        conversionRate,
      },
      directInvitesSent: Number(directInvitesSentRow[0]?.count ?? 0),
      joinRequests: {
        submitted: Number(joinRequestsSubmittedRow[0]?.count ?? 0),
        approved: Number(joinRequestsApprovedRow[0]?.count ?? 0),
        rejected: Number(joinRequestsRejectedRow[0]?.count ?? 0),
      },
      lfgActiveUsers: Number(lfgActiveUsersRow[0]?.count ?? 0),
      newUsersByProvider,
    };

    return data;
  });
