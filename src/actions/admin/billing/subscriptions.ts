"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { assertAdmin } from "@/lib/admin/assert-admin";
import type { PaginatedResponse } from "@/lib/admin/types";
import { actionClient } from "@/lib/next-safe-action";
import type { PlanTier } from "@/lib/user-plan/types";
import { count, desc, eq } from "drizzle-orm";
import z from "zod";

export interface AdminSubscriptionListItem {
  userId: string;
  userName: string;
  userEmail: string;
  planTier: PlanTier;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  stripeSubscriptionId: string;
}

const listAdminSubscriptionsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export type ListAdminSubscriptionsInput = z.infer<
  typeof listAdminSubscriptionsInputSchema
>;

export const listAdminSubscriptions = actionClient
  .inputSchema(listAdminSubscriptionsInputSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const page = parsedInput.page;
    const pageSize = parsedInput.pageSize;
    const offset = (page - 1) * pageSize;

    const [rows, totalCountRow] = await Promise.all([
      db
        .select({
          userId: userBillingSubscription.userId,
          userName: usersTable.name,
          userEmail: usersTable.email,
          planTier: userBillingSubscription.planTier,
          status: userBillingSubscription.status,
          currentPeriodStart: userBillingSubscription.currentPeriodStart,
          currentPeriodEnd: userBillingSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: userBillingSubscription.cancelAtPeriodEnd,
          gracePeriodEndsAt: userBillingSubscription.gracePeriodEndsAt,
          stripeSubscriptionId: userBillingSubscription.stripeSubscriptionId,
        })
        .from(userBillingSubscription)
        .innerJoin(usersTable, eq(usersTable.id, userBillingSubscription.userId))
        .orderBy(desc(userBillingSubscription.updatedAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(userBillingSubscription)
        .then((result) => result[0]?.total ?? 0),
    ]);

    const totalCount = Number(totalCountRow);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const items: AdminSubscriptionListItem[] = rows.map((row) => ({
      userId: row.userId,
      userName: row.userName,
      userEmail: row.userEmail,
      planTier: row.planTier,
      status: row.status,
      currentPeriodStart: row.currentPeriodStart.toISOString(),
      currentPeriodEnd: row.currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: row.cancelAtPeriodEnd,
      gracePeriodEndsAt: row.gracePeriodEndsAt?.toISOString() ?? null,
      stripeSubscriptionId: row.stripeSubscriptionId,
    }));

    const response: PaginatedResponse<AdminSubscriptionListItem> = {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
    };

    return response;
  });
