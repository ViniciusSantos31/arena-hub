import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

// Enum para categoria do tutorial
export const tutorialCategoryEnum = pgEnum("tutorial_category", [
  "basic",
  "intermediate",
  "advanced",
]);

// Tabela de seções do tutorial
export const tutorialSections = pgTable("tutorial_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Nome do ícone (ex: "PlayCircle", "Users")
  category: tutorialCategoryEnum("category").notNull(),
  estimatedTime: text("estimated_time").notNull(), // ex: "5 min"
  order: integer("order").notNull(), // Para ordenação das seções
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de passos do tutorial
export const tutorialSteps = pgTable("tutorial_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => tutorialSections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  order: integer("order").notNull(), // Para ordenação dos passos dentro da seção
  actionButtonText: text("action_button_text"), // Texto do botão de ação (opcional)
  actionButtonHref: text("action_button_href"), // Link do botão de ação (opcional)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela de progresso do usuário no tutorial
export const userTutorialProgress = pgTable("user_tutorial_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  sectionId: uuid("section_id")
    .notNull()
    .references(() => tutorialSections.id, { onDelete: "cascade" }),
  stepId: uuid("step_id").references(() => tutorialSteps.id, {
    onDelete: "cascade",
  }), // null = completou a seção inteira
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relacionamentos
export const tutorialSectionsRelations = relations(
  tutorialSections,
  ({ many }) => ({
    steps: many(tutorialSteps),
    userProgress: many(userTutorialProgress),
  }),
);

export const tutorialStepsRelations = relations(
  tutorialSteps,
  ({ one, many }) => ({
    section: one(tutorialSections, {
      fields: [tutorialSteps.sectionId],
      references: [tutorialSections.id],
    }),
    userProgress: many(userTutorialProgress),
  }),
);

export const userTutorialProgressRelations = relations(
  userTutorialProgress,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userTutorialProgress.userId],
      references: [usersTable.id],
    }),
    section: one(tutorialSections, {
      fields: [userTutorialProgress.sectionId],
      references: [tutorialSections.id],
    }),
    step: one(tutorialSteps, {
      fields: [userTutorialProgress.stepId],
      references: [tutorialSteps.id],
    }),
  }),
);

// Tipos TypeScript para uso na aplicação
export type TutorialSection = typeof tutorialSections.$inferSelect;
export type NewTutorialSection = typeof tutorialSections.$inferInsert;

export type TutorialStep = typeof tutorialSteps.$inferSelect;
export type NewTutorialStep = typeof tutorialSteps.$inferInsert;

export type UserTutorialProgress = typeof userTutorialProgress.$inferSelect;
export type NewUserTutorialProgress = typeof userTutorialProgress.$inferInsert;

// Tipo para seção completa com seus passos
export type TutorialSectionWithSteps = TutorialSection & {
  steps: TutorialStep[];
};

// Tipo para progresso do usuário com dados relacionados
export type UserProgressWithDetails = UserTutorialProgress & {
  section: TutorialSection;
  step?: TutorialStep;
};
