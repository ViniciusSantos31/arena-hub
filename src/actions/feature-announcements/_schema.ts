import { DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL } from "@/lib/feature-announcement-defaults";
import type { GroupAction } from "@/lib/group-permissions";
import { z } from "zod/v4";

export { DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL };

export const groupActionSchema = z.custom<GroupAction>((val) => {
  return (
    typeof val === "string" &&
    [
      "match:create",
      "match:read",
      "match:join",
      "match:update",
      "match:delete",
      "team:create",
      "team:update",
      "match:join_queue",
      "membership:update",
      "membership:delete",
      "membership:approve",
      "group:settings",
      "group:links",
    ].includes(val)
  );
}, "Ação inválida");

export const adminUpsertFeatureAnnouncementSchema = z.object({
  slug: z.string().trim().min(1).max(64),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  icon: z.string().trim().min(1).max(64),
  dismissButtonLabel: z
    .string()
    .trim()
    .min(1)
    .max(80)
    .default(DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL),
  requiredAction: groupActionSchema,
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional(),
  priority: z.number().int().min(0).max(100).default(0),
});

