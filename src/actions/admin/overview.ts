"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { sql } from "drizzle-orm";
import dayjs from "dayjs";
import { headers } from "next/headers";

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

export const adminOverview = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Acesso negado");
  }

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

  const usersInRange = await db.query.usersTable.findMany({
    where: (t, { and, gte, lte }) =>
      and(gte(t.createdAt, dateRangeStart), lte(t.createdAt, dateRangeEnd)),
    columns: { createdAt: true },
  });

  const groupsInRange = await db.query.organization.findMany({
    where: (t, { and, gte, lte }) =>
      and(gte(t.createdAt, dateRangeStart), lte(t.createdAt, dateRangeEnd)),
    columns: { createdAt: true },
  });

  const matchesInRange = await db.query.matchesTable.findMany({
    where: (t, { and, gte, lte }) =>
      and(gte(t.createdAt, dateRangeStart), lte(t.createdAt, dateRangeEnd)),
    columns: { createdAt: true },
  });

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
    activitySeries: dateIntervalArray.map((date) => ({
      date: date.toISOString(),
      users: usersInRange.filter((u) => dayjs(u.createdAt).isSame(date, "day")).length,
      groups: groupsInRange.filter((g) => dayjs(g.createdAt).isSame(date, "day")).length,
      matches: matchesInRange.filter((m) => dayjs(m.createdAt).isSame(date, "day")).length,
    })),
  };

  return data;
});

