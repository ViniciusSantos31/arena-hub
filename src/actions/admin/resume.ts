"use server";

import { db } from "@/db";
import { matchesTable } from "@/db/schema/match";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { and, gte, lte, sql } from "drizzle-orm";
import dayjs from "dayjs";

function countsByDayMap(rows: Array<{ date: string; count: number }>) {
  return new Map(rows.map((row) => [row.date, row.count]));
}

export const adminResume = actionClient.action(async () => {
  await assertAdmin();

  const dateRangeStart = dayjs().subtract(90, "day").startOf("day").toDate();
  const dateRangeEnd = dayjs().endOf("day").toDate();

  const dateIntervalArray: Date[] = [];
  let currentDate = dayjs(dateRangeStart);

  while (currentDate.isBefore(dayjs(dateRangeEnd))) {
    dateIntervalArray.push(currentDate.toDate());
    currentDate = currentDate.add(1, "day");
  }

  const [usersByDay, matchesByDay] = await Promise.all([
    db
      .select({
        date: sql<string>`DATE(${usersTable.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(usersTable)
      .where(
        and(
          gte(usersTable.createdAt, dateRangeStart),
          lte(usersTable.createdAt, dateRangeEnd),
        ),
      )
      .groupBy(sql`DATE(${usersTable.createdAt})`),
    db
      .select({
        date: sql<string>`DATE(${matchesTable.createdAt})`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(matchesTable)
      .where(
        and(
          gte(matchesTable.createdAt, dateRangeStart),
          lte(matchesTable.createdAt, dateRangeEnd),
        ),
      )
      .groupBy(sql`DATE(${matchesTable.createdAt})`),
  ]);

  const usersByDayMap = countsByDayMap(usersByDay);
  const matchesByDayMap = countsByDayMap(matchesByDay);

  return {
    resume: dateIntervalArray.map((date) => {
      const dayKey = dayjs(date).format("YYYY-MM-DD");
      return {
        date: date.toISOString(),
        users: usersByDayMap.get(dayKey) ?? 0,
        matches: matchesByDayMap.get(dayKey) ?? 0,
      };
    }),
  };
});
