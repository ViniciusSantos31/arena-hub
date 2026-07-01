"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { feedbackTable } from "@/db/schema/feedback";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { playersTable } from "@/db/schema/player";
import { pushSubscriptions } from "@/db/schema/subscription";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { PLAN_TIERS } from "@/lib/user-plan/plan-tiers";
import type { PlanTier } from "@/lib/user-plan/types";
import dayjs from "dayjs";
import { and, eq, gte, inArray, lte, sql, type SQLWrapper } from "drizzle-orm";
import z from "zod";

const TIER_CENTS: Record<PlanTier, number> = {
  basic: 500,
  intermediate: 1500,
  premium: 5000,
};

export interface AdminExecutiveMetricsData {
  period: { start: string; end: string };
  activeUsers: { d7: number; d30: number };
  activeGroups: { d7: number; d30: number };
  matchCompletionRate: number;
  subscribers: {
    active: number;
    pastDue: number;
    byTier: Record<PlanTier, number>;
  };
  mrrEstimatedCents: number;
  earlyAdopters: number;
  pendingFeedbacks: number;
  pushSubscriptions: number;
  avgMembersPerGroup: number;
  alerts: Array<{ type: string; count: number; href: string; label: string }>;
  activitySeries: Array<{
    date: string;
    users: number;
    groups: number;
    matches: number;
  }>;
}

function countsByDayMap(rows: Array<{ date: string; count: number }>) {
  return new Map(rows.map((row) => [row.date, row.count]));
}

function countActiveUsersSql(cutoff: Date) {
  return sql<number>`(
    SELECT COUNT(DISTINCT user_id)::int FROM (
      SELECT ${playersTable.userId} AS user_id
      FROM ${playersTable}
      WHERE ${playersTable.userId} IS NOT NULL
        AND ${playersTable.createdAt} >= ${cutoff}
      UNION
      SELECT ${member.userId} AS user_id
      FROM ${member}
      INNER JOIN ${matchesTable}
        ON ${matchesTable.organizationId} = ${member.organizationId}
      WHERE ${matchesTable.createdAt} >= ${cutoff}
        AND ${member.role} IN ('owner', 'admin')
    ) AS active_users
  )`;
}

function countActiveGroupsSql(cutoff: Date) {
  return sql<number>`(
    SELECT COUNT(DISTINCT org_id)::int FROM (
      SELECT ${matchesTable.organizationId} AS org_id
      FROM ${matchesTable}
      WHERE ${matchesTable.organizationId} IS NOT NULL
        AND ${matchesTable.createdAt} >= ${cutoff}
      UNION
      SELECT ${member.organizationId} AS org_id
      FROM ${member}
      WHERE ${member.createdAt} >= ${cutoff}
    ) AS active_groups
  )`;
}

function emptyTierCounts(): Record<PlanTier, number> {
  return { basic: 0, intermediate: 0, premium: 0 };
}

export const adminExecutiveMetrics = actionClient
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
    const cutoff7 = dayjs().subtract(7, "day").startOf("day").toDate();
    const cutoff30 = dayjs().subtract(30, "day").startOf("day").toDate();

    const dateIntervalArray: Date[] = [];
    let currentDate = dayjs(periodStart);
    while (currentDate.isBefore(dayjs(periodEnd).add(1, "day"))) {
      dateIntervalArray.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }

    const dateFilter = (createdAt: SQLWrapper) =>
      and(gte(createdAt, periodStart), lte(createdAt, periodEnd));

    const [
      activityRow,
      matchStatusRow,
      subscriberRows,
      pastDueRow,
      earlyAdoptersRow,
      pendingFeedbacksRow,
      pushSubscriptionsRow,
      avgMembersRow,
      usersByDay,
      groupsByDay,
      matchesByDay,
    ] = await Promise.all([
      db
        .select({
          activeUsersD7: countActiveUsersSql(cutoff7),
          activeUsersD30: countActiveUsersSql(cutoff30),
          activeGroupsD7: countActiveGroupsSql(cutoff7),
          activeGroupsD30: countActiveGroupsSql(cutoff30),
        })
        .from(usersTable)
        .limit(1),
      db
        .select({
          completed: sql<number>`(SELECT COUNT(*)::int FROM ${matchesTable} m WHERE m.status = 'completed')`,
          cancelled: sql<number>`(SELECT COUNT(*)::int FROM ${matchesTable} m WHERE m.status = 'cancelled')`,
        })
        .from(matchesTable)
        .limit(1),
      db
        .select({
          planTier: userBillingSubscription.planTier,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(userBillingSubscription)
        .where(inArray(userBillingSubscription.status, ["active", "trialing"]))
        .groupBy(userBillingSubscription.planTier),
      db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(userBillingSubscription)
        .where(eq(userBillingSubscription.status, "past_due")),
      db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(usersTable)
        .where(eq(usersTable.isEarlyAdopter, true)),
      db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(feedbackTable)
        .where(eq(feedbackTable.isApproved, false)),
      db
        .select({
          count: sql<number>`COUNT(*)::int`,
        })
        .from(pushSubscriptions),
      db
        .select({
          avgMembers: sql<number>`CASE
            WHEN (SELECT COUNT(*) FROM ${organization}) = 0 THEN 0
            ELSE ROUND(
              (SELECT COUNT(*)::numeric FROM ${member}) /
              (SELECT COUNT(*)::numeric FROM ${organization}),
              1
            )
          END`,
        })
        .from(organization)
        .limit(1),
      db
        .select({
          date: sql<string>`DATE(${usersTable.createdAt})`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(usersTable)
        .where(dateFilter(usersTable.createdAt))
        .groupBy(sql`DATE(${usersTable.createdAt})`),
      db
        .select({
          date: sql<string>`DATE(${organization.createdAt})`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(organization)
        .where(dateFilter(organization.createdAt))
        .groupBy(sql`DATE(${organization.createdAt})`),
      db
        .select({
          date: sql<string>`DATE(${matchesTable.createdAt})`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(matchesTable)
        .where(dateFilter(matchesTable.createdAt))
        .groupBy(sql`DATE(${matchesTable.createdAt})`),
    ]);

    const usersByDayMap = countsByDayMap(usersByDay);
    const groupsByDayMap = countsByDayMap(groupsByDay);
    const matchesByDayMap = countsByDayMap(matchesByDay);

    const completed = Number(matchStatusRow[0]?.completed ?? 0);
    const cancelled = Number(matchStatusRow[0]?.cancelled ?? 0);
    const matchCompletionRate =
      completed + cancelled === 0
        ? 0
        : Math.round((completed / (completed + cancelled)) * 1000) / 10;

    const byTier = emptyTierCounts();
    for (const row of subscriberRows) {
      byTier[row.planTier] = Number(row.count);
    }

    const activeSubscribers = subscriberRows.reduce(
      (sum, row) => sum + Number(row.count),
      0,
    );
    const mrrEstimatedCents = PLAN_TIERS.reduce(
      (sum, tier) => sum + byTier[tier] * TIER_CENTS[tier],
      0,
    );

    const pendingFeedbacks = Number(pendingFeedbacksRow[0]?.count ?? 0);
    const pastDue = Number(pastDueRow[0]?.count ?? 0);

    const alerts: AdminExecutiveMetricsData["alerts"] = [];
    if (pendingFeedbacks > 0) {
      alerts.push({
        type: "pending_feedbacks",
        count: pendingFeedbacks,
        href: "/admin/feedbacks",
        label: "Feedbacks pendentes de moderação",
      });
    }
    if (pastDue > 0) {
      alerts.push({
        type: "past_due",
        count: pastDue,
        href: "/admin/billing",
        label: "Assinaturas com pagamento em atraso",
      });
    }

    const metricsRow = activityRow[0];

    const data: AdminExecutiveMetricsData = {
      period: {
        start: periodStart.toISOString(),
        end: periodEnd.toISOString(),
      },
      activeUsers: {
        d7: Number(metricsRow?.activeUsersD7 ?? 0),
        d30: Number(metricsRow?.activeUsersD30 ?? 0),
      },
      activeGroups: {
        d7: Number(metricsRow?.activeGroupsD7 ?? 0),
        d30: Number(metricsRow?.activeGroupsD30 ?? 0),
      },
      matchCompletionRate,
      subscribers: {
        active: activeSubscribers,
        pastDue,
        byTier,
      },
      mrrEstimatedCents,
      earlyAdopters: Number(earlyAdoptersRow[0]?.count ?? 0),
      pendingFeedbacks,
      pushSubscriptions: Number(pushSubscriptionsRow[0]?.count ?? 0),
      avgMembersPerGroup: Number(avgMembersRow[0]?.avgMembers ?? 0),
      alerts,
      activitySeries: dateIntervalArray.map((date) => {
        const dayKey = dayjs(date).format("YYYY-MM-DD");
        return {
          date: date.toISOString(),
          users: usersByDayMap.get(dayKey) ?? 0,
          groups: groupsByDayMap.get(dayKey) ?? 0,
          matches: matchesByDayMap.get(dayKey) ?? 0,
        };
      }),
    };

    return data;
  });
