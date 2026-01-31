"use server";

import { db } from "@/db";
import {
  tutorialSections,
  tutorialSteps,
  userTutorialProgress,
  type TutorialSectionWithSteps,
  type UserProgressWithDetails,
} from "@/db/schema/tutorial";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

// Buscar todas as seções do tutorial com seus passos
export const getTutorialSections = actionClient.action(async () => {
  const sections = await db.query.tutorialSections.findMany({
    where: eq(tutorialSections.isActive, true),
    orderBy: [tutorialSections.order],
    with: {
      steps: {
        where: eq(tutorialSteps.isActive, true),
        orderBy: [tutorialSteps.order],
      },
    },
  });

  return sections as TutorialSectionWithSteps[];
});

// Buscar progresso do usuário no tutorial
export const getUserTutorialProgress = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const progress = await db.query.userTutorialProgress.findMany({
    where: eq(userTutorialProgress.userId, session.user.id),
    with: {
      section: true,
      step: true,
    },
    orderBy: [desc(userTutorialProgress.completedAt)],
  });

  return progress as UserProgressWithDetails[];
});

// Marcar seção como concluída
export const markSectionAsCompleted = actionClient
  .inputSchema(
    z.object({
      sectionId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { sectionId } = parsedInput;

    // Verificar se já existe um registro de progresso para esta seção
    const existingProgress = await db.query.userTutorialProgress.findFirst({
      where: and(
        eq(userTutorialProgress.userId, session.user.id),
        eq(userTutorialProgress.sectionId, sectionId),
      ),
    });

    if (existingProgress) {
      // Atualizar registro existente
      await db
        .update(userTutorialProgress)
        .set({
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userTutorialProgress.id, existingProgress.id));
    } else {
      // Criar novo registro
      await db.insert(userTutorialProgress).values({
        userId: session.user.id,
        sectionId,
        stepId: null, // null indica que completou a seção inteira
        isCompleted: true,
        completedAt: new Date(),
      });
    }

    return { success: true };
  });

// Marcar passo específico como concluído
export const markStepAsCompleted = actionClient
  .inputSchema(
    z.object({
      sectionId: z.string().uuid(),
      stepId: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { sectionId, stepId } = parsedInput;

    // Verificar se já existe um registro de progresso para este passo
    const existingProgress = await db.query.userTutorialProgress.findFirst({
      where: and(
        eq(userTutorialProgress.userId, session.user.id),
        eq(userTutorialProgress.sectionId, sectionId),
        eq(userTutorialProgress.stepId, stepId),
      ),
    });

    if (existingProgress) {
      // Atualizar registro existente
      await db
        .update(userTutorialProgress)
        .set({
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userTutorialProgress.id, existingProgress.id));
    } else {
      // Criar novo registro
      await db.insert(userTutorialProgress).values({
        userId: session.user.id,
        sectionId,
        stepId,
        isCompleted: true,
        completedAt: new Date(),
      });
    }

    return { success: true };
  });

// Buscar estatísticas de progresso do usuário
export const getTutorialStats = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  // Total de seções disponíveis
  const totalSections = await db.$count(
    tutorialSections,
    eq(tutorialSections.isActive, true),
  );

  // Seções completadas pelo usuário
  const completedSections = await db.$count(
    userTutorialProgress,
    and(
      eq(userTutorialProgress.userId, session.user.id),
      eq(userTutorialProgress.isCompleted, true),
    ),
  );

  // Total de passos disponíveis
  const totalSteps = await db.$count(
    tutorialSteps,
    eq(tutorialSteps.isActive, true),
  );

  // Passos completados pelo usuário
  const completedSteps = await db.$count(
    userTutorialProgress,
    and(
      eq(userTutorialProgress.userId, session.user.id),
      eq(userTutorialProgress.isCompleted, true),
    ),
  );

  const progressPercentage =
    totalSections > 0 ? (completedSections / totalSections) * 100 : 0;

  return {
    totalSections,
    completedSections,
    totalSteps,
    completedSteps,
    progressPercentage: Math.round(progressPercentage),
  };
});
