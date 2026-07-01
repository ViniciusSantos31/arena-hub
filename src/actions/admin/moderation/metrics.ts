"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { feedbackTable } from "@/db/schema/feedback";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { punishmentTable } from "@/db/schema/punishment";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import type { PaginatedResponse } from "@/lib/admin/types";
import { actionClient } from "@/lib/next-safe-action";
import { alias } from "drizzle-orm/pg-core";
import dayjs from "dayjs";
import { and, count, desc, eq, gt, gte, lte, sql } from "drizzle-orm";
import z from "zod";

export interface AdminHighCancellationGroup {
  organizationId: string;
  organizationName: string;
  organizationCode: string;
  completedMatches: number;
  cancelledMatches: number;
  cancellationRate: number;
}

export interface AdminCrossGroupPunishmentItem {
  id: string;
  reason: string | null;
  createdAt: string;
  organizationId: string | null;
  organizationName: string | null;
  organizationCode: string | null;
  memberId: string | null;
  memberUserId: string | null;
  memberUserName: string | null;
  appliedByUserId: string | null;
  appliedByUserName: string | null;
}

export interface AdminModerationMetricsData {
  period: { start: string; end: string };
  avgFeedbackRating: number;
  pendingFeedbacks: number;
  punishmentsInPeriod: number;
  suspendedMembers: number;
  highCancellationGroups: AdminHighCancellationGroup[];
}

export const adminModerationMetrics = actionClient
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

    const [
      avgRatingRow,
      pendingFeedbacksRow,
      punishmentsInPeriodRow,
      suspendedMembersRow,
      highCancellationRows,
    ] = await Promise.all([
      db
        .select({
          avgRating: sql<number>`COALESCE(ROUND(AVG(${feedbackTable.rating})::numeric, 1), 0)`,
        })
        .from(feedbackTable),
      db
        .select({ total: count() })
        .from(feedbackTable)
        .where(eq(feedbackTable.isApproved, false))
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({ total: count() })
        .from(punishmentTable)
        .where(
          and(
            gte(punishmentTable.createdAt, periodStart),
            lte(punishmentTable.createdAt, periodEnd),
          ),
        )
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({ total: count() })
        .from(member)
        .where(gt(member.suspendedUntilMatchCount, 0))
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({
          organizationId: organization.id,
          organizationName: organization.name,
          organizationCode: organization.code,
          completedMatches: sql<number>`COUNT(*) FILTER (WHERE ${matchesTable.status} = 'completed')::int`,
          cancelledMatches: sql<number>`COUNT(*) FILTER (WHERE ${matchesTable.status} = 'cancelled')::int`,
        })
        .from(organization)
        .innerJoin(
          matchesTable,
          eq(matchesTable.organizationId, organization.id),
        )
        .groupBy(organization.id, organization.name, organization.code)
        .having(
          sql`COUNT(*) FILTER (WHERE ${matchesTable.status} IN ('completed', 'cancelled')) >= 3`,
        )
        .orderBy(
          sql`CASE
            WHEN COUNT(*) FILTER (WHERE ${matchesTable.status} IN ('completed', 'cancelled')) = 0 THEN 0
            ELSE COUNT(*) FILTER (WHERE ${matchesTable.status} = 'cancelled')::float /
              COUNT(*) FILTER (WHERE ${matchesTable.status} IN ('completed', 'cancelled'))::float
          END DESC`,
        )
        .limit(5),
    ]);

    const highCancellationGroups: AdminHighCancellationGroup[] =
      highCancellationRows.map((row) => {
        const completed = Number(row.completedMatches);
        const cancelled = Number(row.cancelledMatches);
        const total = completed + cancelled;
        const cancellationRate =
          total === 0 ? 0 : Math.round((cancelled / total) * 1000) / 10;

        return {
          organizationId: row.organizationId,
          organizationName: row.organizationName,
          organizationCode: row.organizationCode,
          completedMatches: completed,
          cancelledMatches: cancelled,
          cancellationRate,
        };
      });

    const data: AdminModerationMetricsData = {
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      avgFeedbackRating: Number(avgRatingRow[0]?.avgRating ?? 0),
      pendingFeedbacks: Number(pendingFeedbacksRow),
      punishmentsInPeriod: Number(punishmentsInPeriodRow),
      suspendedMembers: Number(suspendedMembersRow),
      highCancellationGroups,
    };

    return data;
  });

export const listAdminCrossGroupPunishments = actionClient
  .inputSchema(
    z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(50).default(50),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const { page, pageSize } = parsedInput;
    const offset = (page - 1) * pageSize;
    const appliedByUser = alias(usersTable, "applied_by_user");

    const [totalCountRow, rows] = await Promise.all([
      db.select({ total: count() }).from(punishmentTable),
      db
        .select({
          id: punishmentTable.id,
          reason: punishmentTable.reason,
          createdAt: punishmentTable.createdAt,
          organizationId: punishmentTable.organizationId,
          organizationName: organization.name,
          organizationCode: organization.code,
          memberId: punishmentTable.memberId,
          memberUserId: member.userId,
          memberUserName: usersTable.name,
          appliedByUserId: punishmentTable.appliedByUserId,
          appliedByUserName: appliedByUser.name,
        })
        .from(punishmentTable)
        .leftJoin(
          organization,
          eq(punishmentTable.organizationId, organization.id),
        )
        .leftJoin(member, eq(punishmentTable.memberId, member.id))
        .leftJoin(usersTable, eq(member.userId, usersTable.id))
        .leftJoin(
          appliedByUser,
          eq(punishmentTable.appliedByUserId, appliedByUser.id),
        )
        .orderBy(desc(punishmentTable.createdAt))
        .limit(pageSize)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountRow[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const items: AdminCrossGroupPunishmentItem[] = rows.map((row) => ({
      id: row.id,
      reason: row.reason,
      createdAt: row.createdAt.toISOString(),
      organizationId: row.organizationId,
      organizationName: row.organizationName,
      organizationCode: row.organizationCode,
      memberId: row.memberId,
      memberUserId: row.memberUserId,
      memberUserName: row.memberUserName,
      appliedByUserId: row.appliedByUserId,
      appliedByUserName: row.appliedByUserName,
    }));

    const data: PaginatedResponse<AdminCrossGroupPunishmentItem> = {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
    };

    return data;
  });
