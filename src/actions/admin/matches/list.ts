"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchStatusEnum, matchesTable } from "@/db/schema/match";
import { playersTable } from "@/db/schema/player";
import { assertAdmin } from "@/lib/admin/assert-admin";
import type { PaginatedResponse } from "@/lib/admin/types";
import { actionClient } from "@/lib/next-safe-action";
import type { Status } from "@/utils/status";
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  sql,
  type SQL,
} from "drizzle-orm";
import z from "zod";

export interface AdminMatchListItem {
  id: string;
  title: string;
  organizationName: string | null;
  organizationCode: string | null;
  status: Status;
  sport: string;
  category: string;
  date: string;
  time: string;
  confirmedPlayers: number;
  maxPlayers: number;
  createdAt: string;
}

export interface AdminMatchMetrics {
  byStatus: Record<Status, number>;
  bySportCategory: Array<{ sport: string; category: string; count: number }>;
  fillRate: number;
  cancellationRate: number;
  avgCompletionTimeHours: number | null;
  topGroups: Array<{
    organizationId: string;
    organizationName: string;
    organizationCode: string;
    matchCount: number;
  }>;
}

export interface ListAdminMatchesResponse {
  metrics: AdminMatchMetrics;
  list: PaginatedResponse<AdminMatchListItem>;
}

const MATCH_STATUSES = matchStatusEnum.enumValues;

const listAdminMatchesInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  organizationId: z.string().optional(),
  status: z.enum(MATCH_STATUSES).optional(),
  sport: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export type ListAdminMatchesInput = z.infer<typeof listAdminMatchesInputSchema>;

function emptyStatusCounts(): Record<Status, number> {
  return {
    scheduled: 0,
    open_registration: 0,
    closed_registration: 0,
    team_sorted: 0,
    completed: 0,
    cancelled: 0,
  };
}

function buildWhereClause(input: ListAdminMatchesInput): SQL | undefined {
  const conditions: SQL[] = [];

  if (input.organizationId) {
    conditions.push(eq(matchesTable.organizationId, input.organizationId));
  }

  if (input.status) {
    conditions.push(eq(matchesTable.status, input.status));
  }

  if (input.sport) {
    conditions.push(eq(matchesTable.sport, input.sport));
  }

  if (input.search?.trim()) {
    conditions.push(ilike(matchesTable.title, `%${input.search.trim()}%`));
  }

  if (input.dateFrom) {
    const from = new Date(input.dateFrom);
    if (!Number.isNaN(from.getTime())) {
      conditions.push(gte(matchesTable.date, from));
    }
  }

  if (input.dateTo) {
    const to = new Date(input.dateTo);
    if (!Number.isNaN(to.getTime())) {
      to.setHours(23, 59, 59, 999);
      conditions.push(lte(matchesTable.date, to));
    }
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

const confirmedPlayersSql = sql<number>`
  (SELECT COUNT(*)::int FROM ${playersTable} p
   WHERE p.match_id = ${matchesTable.id}
     AND p.confirmed = true
     AND p.waiting_queue = false
     AND p.banned_from_match = false)
`;

export const listAdminMatches = actionClient
  .inputSchema(listAdminMatchesInputSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const page = parsedInput.page;
    const pageSize = parsedInput.pageSize;
    const offset = (page - 1) * pageSize;
    const whereClause = buildWhereClause(parsedInput);

    const [
      rows,
      totalCountRow,
      statusRows,
      sportCategoryRows,
      fillRateRow,
      cancellationRow,
      avgCompletionRow,
      topGroupRows,
    ] = await Promise.all([
      db
        .select({
          id: matchesTable.id,
          title: matchesTable.title,
          status: matchesTable.status,
          sport: matchesTable.sport,
          category: matchesTable.category,
          date: matchesTable.date,
          time: matchesTable.time,
          maxPlayers: matchesTable.maxPlayers,
          createdAt: matchesTable.createdAt,
          organizationName: organization.name,
          organizationCode: organization.code,
          confirmedPlayers: confirmedPlayersSql,
        })
        .from(matchesTable)
        .leftJoin(
          organization,
          eq(matchesTable.organizationId, organization.id),
        )
        .where(whereClause)
        .orderBy(desc(matchesTable.date), desc(matchesTable.createdAt))
        .limit(pageSize)
        .offset(offset),
      db
        .select({ total: count() })
        .from(matchesTable)
        .where(whereClause)
        .then((result) => result[0]?.total ?? 0),
      db
        .select({
          status: matchesTable.status,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(matchesTable)
        .where(whereClause)
        .groupBy(matchesTable.status),
      db
        .select({
          sport: matchesTable.sport,
          category: matchesTable.category,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(matchesTable)
        .where(whereClause)
        .groupBy(matchesTable.sport, matchesTable.category)
        .orderBy(sql`COUNT(*) DESC`)
        .limit(10),
      db
        .select({
          fillRate: sql<number>`CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(
              AVG(
                CASE
                  WHEN ${matchesTable.maxPlayers} > 0 THEN
                    (${confirmedPlayersSql})::numeric / ${matchesTable.maxPlayers}
                  ELSE 0
                END
              ) * 100,
              1
            )
          END`,
        })
        .from(matchesTable)
        .where(whereClause)
        .then((result) => result[0]?.fillRate ?? 0),
      db
        .select({
          total: sql<number>`COUNT(*)::int`,
          cancelled: sql<number>`COUNT(*) FILTER (WHERE ${matchesTable.status} = 'cancelled')::int`,
        })
        .from(matchesTable)
        .where(whereClause)
        .then((result) => result[0] ?? { total: 0, cancelled: 0 }),
      db
        .select({
          avgHours: sql<number | null>`ROUND(
            AVG(
              EXTRACT(EPOCH FROM (${matchesTable.updatedAt} - ${matchesTable.createdAt})) / 3600
            )::numeric,
            1
          )`,
        })
        .from(matchesTable)
        .where(
          whereClause
            ? and(whereClause, eq(matchesTable.status, "completed"))
            : eq(matchesTable.status, "completed"),
        )
        .then((result) => result[0]?.avgHours ?? null),
      db
        .select({
          organizationId: matchesTable.organizationId,
          organizationName: organization.name,
          organizationCode: organization.code,
          matchCount: sql<number>`COUNT(*)::int`,
        })
        .from(matchesTable)
        .innerJoin(
          organization,
          eq(matchesTable.organizationId, organization.id),
        )
        .where(whereClause)
        .groupBy(
          matchesTable.organizationId,
          organization.name,
          organization.code,
        )
        .orderBy(sql`COUNT(*) DESC`)
        .limit(5),
    ]);

    const totalCount = Number(totalCountRow);
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const items: AdminMatchListItem[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      organizationName: row.organizationName ?? null,
      organizationCode: row.organizationCode ?? null,
      status: row.status,
      sport: row.sport,
      category: row.category,
      date: row.date.toISOString(),
      time: row.time,
      confirmedPlayers: Number(row.confirmedPlayers),
      maxPlayers: row.maxPlayers,
      createdAt: row.createdAt.toISOString(),
    }));

    const byStatus = emptyStatusCounts();
    for (const row of statusRows) {
      byStatus[row.status] = Number(row.count);
    }

    const totalMatches = Number(cancellationRow.total);
    const cancelledMatches = Number(cancellationRow.cancelled);
    const cancellationRate =
      totalMatches === 0
        ? 0
        : Math.round((cancelledMatches / totalMatches) * 1000) / 10;

    const metrics: AdminMatchMetrics = {
      byStatus,
      bySportCategory: sportCategoryRows.map((row) => ({
        sport: row.sport,
        category: row.category,
        count: Number(row.count),
      })),
      fillRate: Number(fillRateRow),
      cancellationRate,
      avgCompletionTimeHours:
        avgCompletionRow === null ? null : Number(avgCompletionRow),
      topGroups: topGroupRows
        .filter((row) => row.organizationId)
        .map((row) => ({
          organizationId: row.organizationId!,
          organizationName: row.organizationName,
          organizationCode: row.organizationCode,
          matchCount: Number(row.matchCount),
        })),
    };

    const response: ListAdminMatchesResponse = {
      metrics,
      list: {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };

    return response;
  });
