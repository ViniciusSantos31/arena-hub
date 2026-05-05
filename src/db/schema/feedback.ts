import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const feedbackTable = pgTable("feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  userNameSnapshot: text("user_name_snapshot").notNull(),
  userImageSnapshot: text("user_image_snapshot"),
  rating: integer("rating").notNull(),
  message: text("message").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feedbackRelations = relations(feedbackTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [feedbackTable.userId],
    references: [usersTable.id],
  }),
}));

