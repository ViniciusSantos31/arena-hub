"use server";

import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const shouldShowFeedbackPopup = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return false;
  }

  const existing = await db.query.feedbackTable.findFirst({
    where: (f, { eq }) => eq(f.userId, session.user.id),
    columns: { id: true },
  });

  if (existing) {
    return false;
  }

  const user = await db.query.usersTable.findFirst({
    where: (u, { eq }) => eq(u.id, session.user.id),
    columns: { createdAt: true },
  });

  const isOldEnough =
    !!user?.createdAt && dayjs().diff(dayjs(user.createdAt), "day") >= 7;

  if (isOldEnough) {
    return true;
  }

  const hasMembership = await db.query.member.findFirst({
    where: eq(member.userId, session.user.id),
    columns: { id: true },
  });

  return !!hasMembership;
});

