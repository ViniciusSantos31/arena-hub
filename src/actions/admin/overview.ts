"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { and, gte, lte, sql, type SQLWrapper } from "drizzle-orm";
import dayjs from "dayjs";

export interface AdminOverviewData {
  totals: {
    users: number;
    groups: number;
    members: number;
    matches: number;
  };
  groups: {
    public: number;
    private: number;
  };
  matchesByStatus: Record<
    | "scheduled"
    | "open_registration"
    | "closed_registration"
    | "team_sorted"
    | "completed"
    | "cancelled",
    number
  >;
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

export const adminOverview = actionClient.action(async () => {
  await assertAdmin();

  const [totalsRow] = await db.select({
    users: sql<number>`(SELECT COUNT(*) FROM ${usersTable})`,
    groups: sql<number>`(SELECT COUNT(*) FROM ${organization})`,
    members: sql<number>`(SELECT COUNT(*) FROM ${member})`,
    matches: sql<number>`(SELECT COUNT(*) FROM ${matchesTable})`,
    groupsPrivate: sql<number>`(SELECT COUNT(*) FROM ${organization} o WHERE o.private = true)`,
    groupsPublic: sql<number>`(SELECT COUNT(*) FROM ${organization} o WHERE o.private = false)`,
    scheduled: sql<number>`(SELECT COUNT(*) FROM ${matchesTable} m WHERE m.status = 'scheduled')`,
    openRegistration: sql<number>`(SELECT COUNT(*) FROM ${matchesTable} m WHERE m.status = 'open_registration')`,
    closedRegistration: sql<number>`(SELECT COUNT(*) FROM ${matchesTable} m WHERE m.status = 'closed_registration')`,
    teamSorted: sql<number>`(SELECT COUNT(*) FROM ${matchesTable} m WHERE m.status = 'team_sorted')`,
    completed: sql<number>`(SELECT COUNT(*) FROM ${matchesTable} m WHERE m.status = 'completed')`,
    cancelled: sql<number>`(SELECT COUNT(*) FROM ${matchesTable} m WHERE m.status = 'cancelled')`,
  }).from(usersTable).limit(1);

  const dateRangeStart = dayjs().subtract(29, "day").startOf("day").toDate();
  const dateRangeEnd = dayjs().endOf("day").toDate();

  const dateIntervalArray: Date[] = [];
  let currentDate = dayjs(dateRangeStart);
  while (currentDate.isBefore(dayjs(dateRangeEnd))) {
    dateIntervalArray.push(currentDate.toDate());
    currentDate = currentDate.add(1, "day");
  }

  const dateFilter = (createdAt: SQLWrapper) =>
    and(gte(createdAt, dateRangeStart), lte(createdAt, dateRangeEnd));

  const [usersByDay, groupsByDay, matchesByDay] = await Promise.all([
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

  const data: AdminOverviewData = {
    totals: {
      users: Number(totalsRow?.users ?? 0),
      groups: Number(totalsRow?.groups ?? 0),
      members: Number(totalsRow?.members ?? 0),
      matches: Number(totalsRow?.matches ?? 0),
    },
    groups: {
      public: Number(totalsRow?.groupsPublic ?? 0),
      private: Number(totalsRow?.groupsPrivate ?? 0),
    },
    matchesByStatus: {
      scheduled: Number(totalsRow?.scheduled ?? 0),
      open_registration: Number(totalsRow?.openRegistration ?? 0),
      closed_registration: Number(totalsRow?.closedRegistration ?? 0),
      team_sorted: Number(totalsRow?.teamSorted ?? 0),
      completed: Number(totalsRow?.completed ?? 0),
      cancelled: Number(totalsRow?.cancelled ?? 0),
    },
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
