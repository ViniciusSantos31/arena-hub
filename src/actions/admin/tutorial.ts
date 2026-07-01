"use server";

import { db } from "@/db";
import {
  tutorialSections,
  tutorialSteps,
  userTutorialProgress,
} from "@/db/schema/tutorial";
import { usersTable } from "@/db/schema/user";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, sql } from "drizzle-orm";

export const tutorialSectionProgress = actionClient.action(async () => {
  await assertAdmin();

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
  await assertAdmin();

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

export const tutorialStepDropOff = actionClient.action(async () => {
  await assertAdmin();

  const steps = await db
    .select({
      stepId: tutorialSteps.id,
      stepTitle: tutorialSteps.title,
      stepOrder: tutorialSteps.order,
      sectionId: tutorialSections.id,
      sectionTitle: tutorialSections.title,
      sectionOrder: tutorialSections.order,
      completedCount: sql<number>`
        (
          SELECT COUNT(DISTINCT utp.user_id)
          FROM ${userTutorialProgress} utp
          WHERE utp.step_id = ${tutorialSteps.id}
            AND utp.is_completed = true
        )
      `,
      reachedCount: sql<number>`
        CASE
          WHEN ${tutorialSteps.order} = 1 THEN
            (
              SELECT COUNT(DISTINCT utp.user_id)
              FROM ${userTutorialProgress} utp
              WHERE utp.section_id = ${tutorialSteps.sectionId}
            )
          ELSE
            (
              SELECT COUNT(DISTINCT utp.user_id)
              FROM ${userTutorialProgress} utp
              INNER JOIN ${tutorialSteps} prev_step
                ON prev_step.id = utp.step_id
              WHERE prev_step.section_id = ${tutorialSteps.sectionId}
                AND prev_step."order" = ${tutorialSteps.order} - 1
                AND prev_step.is_active = true
                AND utp.is_completed = true
            )
        END
      `,
    })
    .from(tutorialSteps)
    .innerJoin(tutorialSections, eq(tutorialSteps.sectionId, tutorialSections.id))
    .where(
      and(eq(tutorialSteps.isActive, true), eq(tutorialSections.isActive, true)),
    )
    .orderBy(tutorialSections.order, tutorialSteps.order);

  return steps.map((step) => {
    const reached = Number(step.reachedCount);
    const completed = Number(step.completedCount);
    const dropOff = Math.max(0, reached - completed);
    const dropOffRate = reached > 0 ? Math.round((dropOff * 100) / reached) : 0;
    const completionRate =
      reached > 0 ? Math.round((completed * 100) / reached) : 0;

    return {
      stepId: step.stepId,
      stepTitle: step.stepTitle,
      stepOrder: step.stepOrder,
      sectionId: step.sectionId,
      sectionTitle: step.sectionTitle,
      sectionOrder: step.sectionOrder,
      reached,
      completed,
      dropOff,
      dropOffRate,
      completionRate,
    };
  });
});
