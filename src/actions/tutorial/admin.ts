"use server";

import { db } from "@/db";
import {
  tutorialSections,
  tutorialSteps,
  type TutorialSectionWithSteps,
} from "@/db/schema/tutorial";
import { actionClient } from "@/lib/next-safe-action";
import { eq, max } from "drizzle-orm";
import z from "zod";

// Schema para validação de seção do tutorial
const tutorialSectionSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  icon: z.string().min(1, "Ícone é obrigatório"),
  category: z.enum(["basic", "intermediate", "advanced"]),
  estimatedTime: z.string().min(1, "Tempo estimado é obrigatório"),
  isActive: z.boolean().default(true),
});

// Schema para validação de passo do tutorial
const tutorialStepSchema = z.object({
  sectionId: z.string().uuid(),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  actionButtonText: z.string().nullable(),
  actionButtonHref: z.string().nullable(),
  isActive: z.boolean().default(true),
});

// Criar nova seção do tutorial
export const createTutorialSection = actionClient
  .inputSchema(tutorialSectionSchema)
  .action(async ({ parsedInput }) => {
    // Buscar a próxima ordem disponível
    const maxOrderResult = await db
      .select({ maxOrder: max(tutorialSections.order) })
      .from(tutorialSections);

    const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1;

    const [newSection] = await db
      .insert(tutorialSections)
      .values({
        ...parsedInput,
        order: nextOrder,
      })
      .returning();

    return newSection;
  });

// Atualizar seção do tutorial
export const updateTutorialSection = actionClient
  .inputSchema(
    tutorialSectionSchema.extend({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, ...updateData } = parsedInput;

    const [updatedSection] = await db
      .update(tutorialSections)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(tutorialSections.id, id))
      .returning();

    return updatedSection;
  });

// Deletar seção do tutorial (soft delete)
export const deleteTutorialSection = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await db
      .update(tutorialSections)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(tutorialSections.id, parsedInput.id));

    return { success: true };
  });

// Reordenar seções do tutorial
export const reorderTutorialSections = actionClient
  .inputSchema(
    z.object({
      sectionOrders: z.array(
        z.object({
          id: z.string().uuid(),
          order: z.number().int().positive(),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { sectionOrders } = parsedInput;

    // Executar atualizações em batch
    await Promise.all(
      sectionOrders.map(({ id, order }) =>
        db
          .update(tutorialSections)
          .set({
            order,
            updatedAt: new Date(),
          })
          .where(eq(tutorialSections.id, id)),
      ),
    );

    return { success: true };
  });

// Criar novo passo do tutorial
export const createTutorialStep = actionClient
  .inputSchema(tutorialStepSchema)
  .action(async ({ parsedInput }) => {
    const { sectionId, ...stepData } = parsedInput;

    // Buscar a próxima ordem disponível dentro da seção
    const maxOrderResult = await db
      .select({ maxOrder: max(tutorialSteps.order) })
      .from(tutorialSteps)
      .where(eq(tutorialSteps.sectionId, sectionId));

    const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1;

    const [newStep] = await db
      .insert(tutorialSteps)
      .values({
        sectionId,
        ...stepData,
        order: nextOrder,
      })
      .returning();

    return newStep;
  });

// Atualizar passo do tutorial
export const updateTutorialStep = actionClient
  .inputSchema(
    tutorialStepSchema.extend({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, ...updateData } = parsedInput;

    const [updatedStep] = await db
      .update(tutorialSteps)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(tutorialSteps.id, id))
      .returning();

    return updatedStep;
  });

// Deletar passo do tutorial (soft delete)
export const deleteTutorialStep = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await db
      .update(tutorialSteps)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(tutorialSteps.id, parsedInput.id));

    return { success: true };
  });

// Reordenar passos dentro de uma seção
export const reorderTutorialSteps = actionClient
  .inputSchema(
    z.object({
      stepOrders: z.array(
        z.object({
          id: z.string().uuid(),
          order: z.number().int().positive(),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { stepOrders } = parsedInput;

    // Executar atualizações em batch
    await Promise.all(
      stepOrders.map(({ id, order }) =>
        db
          .update(tutorialSteps)
          .set({
            order,
            updatedAt: new Date(),
          })
          .where(eq(tutorialSteps.id, id)),
      ),
    );

    return { success: true };
  });

// Buscar todas as seções para administração
export const getAllTutorialSectionsForAdmin = actionClient.action(async () => {
  const sections = await db.query.tutorialSections.findMany({
    orderBy: [tutorialSections.order],
    with: {
      steps: {
        orderBy: [tutorialSteps.order],
      },
    },
  });

  return sections as TutorialSectionWithSteps[];
});

// Buscar uma seção específica com seus passos
export const getTutorialSectionById = actionClient
  .inputSchema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const section = await db.query.tutorialSections.findFirst({
      where: eq(tutorialSections.id, parsedInput.id),
      with: {
        steps: {
          orderBy: [tutorialSteps.order],
        },
      },
    });

    return section as TutorialSectionWithSteps | undefined;
  });
