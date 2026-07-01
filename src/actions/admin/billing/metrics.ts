"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { PLAN_TIERS } from "@/lib/user-plan/plan-tiers";
import type { PlanTier } from "@/lib/user-plan/types";
import dayjs from "dayjs";
import { and, count, eq, gte, inArray, sql } from "drizzle-orm";
import z from "zod";

const TIER_CENTS: Record<PlanTier, number> = {
  basic: 500,
  intermediate: 1500,
  premium: 5000,
};

export interface AdminBillingMetricsData {
  mrrEstimatedCents: number;
  subscribersByTier: Record<PlanTier, number>;
  newSubscriptions: number;
  cancellations: number;
  pastDue: number;
  cancelAtPeriodEnd: number;
  earlyAdoptersWithoutPlan: number;
  statusDistribution: Record<string, number>;
}

function emptyTierCounts(): Record<PlanTier, number> {
  return { basic: 0, intermediate: 0, premium: 0 };
}

export const adminBillingMetrics = actionClient
  .inputSchema(
    z.object({
      periodDays: z.number().int().min(1).max(365).default(30),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const periodDays = parsedInput.periodDays;
    const periodStart = dayjs()
      .subtract(periodDays - 1, "day")
      .startOf("day")
      .toDate();

    const activeStatuses = ["active", "trialing"] as const;

    const [
      tierRows,
      statusRows,
      newSubscriptionsRow,
      cancellationsRow,
      pastDueRow,
      cancelAtPeriodEndRow,
      earlyAdoptersWithoutPlanRow,
    ] = await Promise.all([
      db
        .select({
          planTier: userBillingSubscription.planTier,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(userBillingSubscription)
        .where(inArray(userBillingSubscription.status, [...activeStatuses]))
        .groupBy(userBillingSubscription.planTier),
      db
        .select({
          status: userBillingSubscription.status,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(userBillingSubscription)
        .groupBy(userBillingSubscription.status),
      db
        .select({ total: count() })
        .from(userBillingSubscription)
        .where(gte(userBillingSubscription.createdAt, periodStart))
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({ total: count() })
        .from(userBillingSubscription)
        .where(
          and(
            eq(userBillingSubscription.status, "canceled"),
            gte(userBillingSubscription.updatedAt, periodStart),
          ),
        )
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({ total: count() })
        .from(userBillingSubscription)
        .where(eq(userBillingSubscription.status, "past_due"))
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({ total: count() })
        .from(userBillingSubscription)
        .where(eq(userBillingSubscription.cancelAtPeriodEnd, true))
        .then((rows) => rows[0]?.total ?? 0),
      db
        .select({ total: count() })
        .from(usersTable)
        .leftJoin(
          userBillingSubscription,
          eq(userBillingSubscription.userId, usersTable.id),
        )
        .where(
          and(
            eq(usersTable.isEarlyAdopter, true),
            sql`(
              ${userBillingSubscription.userId} IS NULL
              OR ${userBillingSubscription.status} NOT IN ('active', 'trialing')
            )`,
          ),
        )
        .then((rows) => rows[0]?.total ?? 0),
    ]);

    const subscribersByTier = emptyTierCounts();
    for (const row of tierRows) {
      subscribersByTier[row.planTier] = Number(row.count);
    }

    const mrrEstimatedCents = PLAN_TIERS.reduce(
      (sum, tier) => sum + subscribersByTier[tier] * TIER_CENTS[tier],
      0,
    );

    const statusDistribution: Record<string, number> = {};
    for (const row of statusRows) {
      statusDistribution[row.status] = Number(row.count);
    }

    const data: AdminBillingMetricsData = {
      mrrEstimatedCents,
      subscribersByTier,
      newSubscriptions: Number(newSubscriptionsRow),
      cancellations: Number(cancellationsRow),
      pastDue: Number(pastDueRow),
      cancelAtPeriodEnd: Number(cancelAtPeriodEndRow),
      earlyAdoptersWithoutPlan: Number(earlyAdoptersWithoutPlanRow),
      statusDistribution,
    };

    return data;
  });
