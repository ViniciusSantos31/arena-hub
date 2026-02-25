"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { headers } from "next/headers";

export const adminResume = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Acesso negado");
  }

  const dateRangeStart = dayjs().subtract(90, "day").startOf("day").toDate();
  const dateRangeEnd = dayjs().endOf("day").toDate();

  const dateIntervalArray = [];
  let currentDate = dayjs(dateRangeStart);

  while (currentDate.isBefore(dayjs(dateRangeEnd))) {
    dateIntervalArray.push(currentDate.toDate());
    currentDate = currentDate.add(1, "day");
  }

  const users = await db.query.usersTable.findMany({
    where: (usersTable, { and, gte, lte }) =>
      and(
        gte(usersTable.createdAt, dateRangeStart),
        lte(usersTable.createdAt, dateRangeEnd),
      ),
  });

  const matches = await db.query.matchesTable.findMany({
    where: (matchesTable, { and, gte, lte }) =>
      and(
        gte(matchesTable.createdAt, dateRangeStart),
        lte(matchesTable.createdAt, dateRangeEnd),
      ),
  });

  return {
    resume: dateIntervalArray.map((date) => {
      const usersCount = users.filter((user) =>
        dayjs(user.createdAt).isSame(date, "day"),
      ).length;
      const matchesCount = matches.filter((match) =>
        dayjs(match.createdAt).isSame(date, "day"),
      ).length;

      return {
        date: date.toISOString(),
        users: usersCount,
        matches: matchesCount,
      };
    }),
  };
});
