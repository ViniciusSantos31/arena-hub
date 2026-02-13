"use server";

import { db } from "@/db";
import { tutorialSections, userTutorialProgress } from "@/db/schema/tutorial";
import { usersTable } from "@/db/schema/user";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

export const tutorialSectionProgress = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Acesso negado");
  }

  const result = await db
    .select({
      title: tutorialSections.title,
      order: tutorialSections.order,

      completedCount: sql<number>`
        COUNT(DISTINCT CASE
          WHEN (
            SELECT COUNT(*)
            FROM user_tutorial_progress utp_inner
            WHERE utp_inner.user_id = ${userTutorialProgress.userId}
              AND utp_inner.section_id = ${tutorialSections.id}
              AND utp_inner.is_completed = true
          ) = (
            SELECT COUNT(*)
            FROM tutorial_steps ts_inner
            WHERE ts_inner.section_id = ${tutorialSections.id}
              AND ts_inner.is_active = true
          )
          THEN ${userTutorialProgress.userId}
        END)
      `,

      inProgressCount: sql<number>`
        COUNT(DISTINCT CASE
          WHEN (
            SELECT COUNT(*)
            FROM user_tutorial_progress utp_inner
            WHERE utp_inner.user_id = ${userTutorialProgress.userId}
              AND utp_inner.section_id = ${tutorialSections.id}
              AND utp_inner.is_completed = true
          ) < (
            SELECT COUNT(*)
            FROM tutorial_steps ts_inner
            WHERE ts_inner.section_id = ${tutorialSections.id}
              AND ts_inner.is_active = true
          )
          THEN ${userTutorialProgress.userId}
        END)
      `,

      // Total de usuários ativos no sistema
      totalUsers: sql<number>`(SELECT COUNT(*) FROM ${usersTable})`,
    })
    .from(tutorialSections)
    .leftJoin(
      userTutorialProgress,
      eq(tutorialSections.id, userTutorialProgress.sectionId),
    )
    .where(eq(tutorialSections.isActive, true))
    .groupBy(
      tutorialSections.id,
      tutorialSections.title,
      tutorialSections.order,
    )
    .orderBy(tutorialSections.order);

  return result.map((section) => {
    const completed = Number(section.completedCount);
    const inProgress = Number(section.inProgressCount);
    const total = Number(section.totalUsers);
    const notStarted = total - completed - inProgress;

    const completionRate =
      total > 0 ? Math.floor((completed * 100) / total) : 0;

    return {
      title: section.title,
      order: section.order,
      completed,
      inProgress,
      notStarted,
      totalUsers: total,
      completionRate,
    };
  });
});

export const getTutorialOverallStats = actionClient.action(async () => {
  const [result] = await db
    .select({
      notStarted: sql<number>`(
        SELECT COUNT(*)
        FROM ${usersTable} u
        WHERE NOT EXISTS (
          SELECT 1
          FROM ${userTutorialProgress} utp
          WHERE utp.user_id = u.id
        )
      )`,

      inProgress: sql<number>`(
        SELECT COUNT(*)
        FROM ${usersTable} u
        WHERE EXISTS (
          SELECT 1
          FROM ${userTutorialProgress} utp
          WHERE utp.user_id = u.id
        )
        AND (
          SELECT COUNT(DISTINCT utp.section_id)
          FROM ${userTutorialProgress} utp
          WHERE utp.user_id = u.id
            AND utp.is_completed = true
        ) < (
          SELECT COUNT(*)
          FROM ${tutorialSections} ts
          WHERE ts.is_active = true
        )
      )`,

      completed: sql<number>`(
        SELECT COUNT(*)
        FROM ${usersTable} u
        WHERE (
          SELECT COUNT(DISTINCT utp.section_id)
          FROM ${userTutorialProgress} utp
          WHERE utp.user_id = u.id
            AND utp.is_completed = true
        ) = (
          SELECT COUNT(*)
          FROM ${tutorialSections} ts
          WHERE ts.is_active = true
        )
      )`,
    })
    .from(usersTable)
    .limit(1);

  return {
    notStarted: Number(result.notStarted),
    inProgress: Number(result.inProgress),
    completed: Number(result.completed),
  };
});
