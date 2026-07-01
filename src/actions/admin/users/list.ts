"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { playersTable } from "@/db/schema/player";
import { tutorialSections, userTutorialProgress } from "@/db/schema/tutorial";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { assertAdmin } from "@/lib/admin/assert-admin";
import type { PaginatedResponse } from "@/lib/admin/types";
import { actionClient } from "@/lib/next-safe-action";
import type { PlanTier } from "@/lib/user-plan/types";
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import z from "zod";

export type TutorialProgressStatus = "not_started" | "in_progress" | "completed";

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  image: string | null;
  emailVerified: boolean;
  isEarlyAdopter: boolean;
  planTier: PlanTier | null;
  subscriptionStatus: string | null;
  ownedGroupsCount: number;
  matchesPlayed: number;
  tutorialProgress: TutorialProgressStatus;
  lookingForGroup: boolean;
  createdAt: string;
}

const listAdminUsersInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  planTier: z.enum(["basic", "intermediate", "premium"]).optional(),
  subscriptionStatus: z
    .enum([
      "active",
      "trialing",
      "past_due",
      "canceled",
      "incomplete",
      "incomplete_expired",
      "unpaid",
    ])
    .optional(),
  isEarlyAdopter: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  createdFrom: z.string().optional(),
  createdTo: z.string().optional(),
});

export type ListAdminUsersInput = z.infer<typeof listAdminUsersInputSchema>;

const tutorialProgressSql = sql<TutorialProgressStatus>`
  CASE
    WHEN NOT EXISTS (
      SELECT 1 FROM ${userTutorialProgress} utp
      WHERE utp.user_id = ${usersTable.id}
    ) THEN 'not_started'
    WHEN (
      SELECT COUNT(*)::int FROM ${tutorialSections} ts
      WHERE ts.is_active = true
    ) = 0 THEN 'completed'
    WHEN (
      SELECT COUNT(DISTINCT utp.section_id)::int
      FROM ${userTutorialProgress} utp
      WHERE utp.user_id = ${usersTable.id}
        AND utp.is_completed = true
    ) >= (
      SELECT COUNT(*)::int FROM ${tutorialSections} ts
      WHERE ts.is_active = true
    ) THEN 'completed'
    ELSE 'in_progress'
  END
`;

function buildWhereClause(input: ListAdminUsersInput) {
  const conditions = [];

  if (input.search?.trim()) {
    const term = `%${input.search.trim()}%`;
    conditions.push(
      or(ilike(usersTable.name, term), ilike(usersTable.email, term)),
    );
  }

  if (input.planTier) {
    conditions.push(eq(userBillingSubscription.planTier, input.planTier));
  }

  if (input.subscriptionStatus) {
    conditions.push(eq(userBillingSubscription.status, input.subscriptionStatus));
  }

  if (input.isEarlyAdopter !== undefined) {
    conditions.push(eq(usersTable.isEarlyAdopter, input.isEarlyAdopter));
  }

  if (input.emailVerified !== undefined) {
    conditions.push(eq(usersTable.emailVerified, input.emailVerified));
  }

  if (input.createdFrom) {
    const from = new Date(input.createdFrom);
    if (!Number.isNaN(from.getTime())) {
      conditions.push(gte(usersTable.createdAt, from));
    }
  }

  if (input.createdTo) {
    const to = new Date(input.createdTo);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      conditions.push(lte(usersTable.createdAt, to));
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export const listAdminUsers = actionClient
  .inputSchema(listAdminUsersInputSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const page = parsedInput.page;
    const pageSize = parsedInput.pageSize;
    const offset = (page - 1) * pageSize;
    const whereClause = buildWhereClause(parsedInput);

    const ownedGroupsCountSql = sql<number>`
      (SELECT COUNT(*)::int FROM ${member} m
       WHERE m.user_id = ${usersTable.id} AND m.role = 'owner')
    `;

    const matchesPlayedSql = sql<number>`
      (SELECT COUNT(*)::int FROM ${playersTable} p
       WHERE p.user_id = ${usersTable.id})
    `;

    const [rows, countRow] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          image: usersTable.image,
          emailVerified: usersTable.emailVerified,
          isEarlyAdopter: usersTable.isEarlyAdopter,
          lookingForGroup: usersTable.lookingForGroup,
          createdAt: usersTable.createdAt,
          planTier: userBillingSubscription.planTier,
          subscriptionStatus: userBillingSubscription.status,
          ownedGroupsCount: ownedGroupsCountSql,
          matchesPlayed: matchesPlayedSql,
          tutorialProgress: tutorialProgressSql,
        })
        .from(usersTable)
        .leftJoin(
          userBillingSubscription,
          eq(userBillingSubscription.userId, usersTable.id),
        )
        .where(whereClause)
        .orderBy(desc(usersTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(usersTable)
        .leftJoin(
          userBillingSubscription,
          eq(userBillingSubscription.userId, usersTable.id),
        )
        .where(whereClause)
        .then((result) => result[0]?.total ?? 0),
    ]);

    const totalCount = Number(countRow);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const items: AdminUserListItem[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image ?? null,
      emailVerified: row.emailVerified,
      isEarlyAdopter: row.isEarlyAdopter,
      planTier: (row.planTier as PlanTier | null) ?? null,
      subscriptionStatus: row.subscriptionStatus ?? null,
      ownedGroupsCount: Number(row.ownedGroupsCount),
      matchesPlayed: Number(row.matchesPlayed),
      tutorialProgress: row.tutorialProgress,
      lookingForGroup: row.lookingForGroup,
      createdAt: row.createdAt.toISOString(),
    }));

    const response: PaginatedResponse<AdminUserListItem> = {
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
    };

    return response;
  });
