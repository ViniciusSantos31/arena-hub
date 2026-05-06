import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const featureAnnouncement = pgTable(
  "feature_announcement",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    icon: text("icon").notNull(),

    dismissButtonLabel: text("dismiss_button_label")
      .notNull()
      .default("É isso aí ✨"),

    requiredAction: text("required_action").notNull(),

    isActive: boolean("is_active").notNull().default(true),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    priority: integer("priority").notNull().default(0),

    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
  },
  (t) => ({
    slugUx: uniqueIndex("feature_announcement_slug_ux").on(t.slug),
    activeLookupIdx: index("feature_announcement_active_lookup_idx").on(
      t.isActive,
      t.startsAt,
      t.endsAt,
      t.priority,
      t.createdAt,
    ),
  }),
);

export const userFeatureAnnouncementState = pgTable(
  "user_feature_announcement_state",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    announcementId: text("announcement_id")
      .notNull()
      .references(() => featureAnnouncement.id, { onDelete: "cascade" }),

    seenAt: timestamp("seen_at")
      .notNull()
      .$defaultFn(() => /* @__PURE__ */ new Date()),
  },
  (t) => ({
    userAnnouncementUx: uniqueIndex("user_feature_announcement_state_ux").on(
      t.userId,
      t.announcementId,
    ),
    userSeenLookupIdx: index("user_feature_announcement_state_user_seen_idx").on(
      t.userId,
      t.seenAt,
    ),
  }),
);

export const featureAnnouncementRelations = relations(
  featureAnnouncement,
  ({ many }) => ({
    states: many(userFeatureAnnouncementState),
  }),
);

export const userFeatureAnnouncementStateRelations = relations(
  userFeatureAnnouncementState,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [userFeatureAnnouncementState.userId],
      references: [usersTable.id],
    }),
    announcement: one(featureAnnouncement, {
      fields: [userFeatureAnnouncementState.announcementId],
      references: [featureAnnouncement.id],
    }),
  }),
);

export type FeatureAnnouncement = typeof featureAnnouncement.$inferSelect;
export type NewFeatureAnnouncement = typeof featureAnnouncement.$inferInsert;

export type UserFeatureAnnouncementState =
  typeof userFeatureAnnouncementState.$inferSelect;
export type NewUserFeatureAnnouncementState =
  typeof userFeatureAnnouncementState.$inferInsert;

