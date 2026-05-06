"use server";

import { db } from "@/db";
import {
  featureAnnouncement,
  userFeatureAnnouncementState,
} from "@/db/schema/feature-announcement";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { roleHasActions, type GroupAction } from "@/lib/group-permissions";
import { actionClient } from "@/lib/next-safe-action";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod/v4";

function parseGroupAction(value: string): GroupAction | null {
  const allowed: GroupAction[] = [
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
  ];
  return allowed.includes(value as GroupAction) ? (value as GroupAction) : null;
}

export const getNextFeatureAnnouncementForUser = actionClient.action(
  async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const memberships = await db.query.member.findMany({
      where: eq(member.userId, session.user.id),
      columns: { role: true },
    });

    if (memberships.length === 0) {
      return null;
    }

    const seen = await db.query.userFeatureAnnouncementState.findMany({
      where: eq(userFeatureAnnouncementState.userId, session.user.id),
      columns: { announcementId: true },
    });

    const seenSet = new Set(seen.map((s) => s.announcementId));

    const now = new Date();

    const activeAnnouncements = await db.query.featureAnnouncement.findMany({
      where: and(
        eq(featureAnnouncement.isActive, true),
        or(
          isNull(featureAnnouncement.startsAt),
          sql`${featureAnnouncement.startsAt} <= ${now}`,
        ),
        or(
          isNull(featureAnnouncement.endsAt),
          sql`${featureAnnouncement.endsAt} > ${now}`,
        ),
      ),
      orderBy: [
        desc(featureAnnouncement.priority),
        desc(featureAnnouncement.createdAt),
      ],
    });

    for (const a of activeAnnouncements) {
      if (seenSet.has(a.id)) continue;

      const action = parseGroupAction(a.requiredAction);
      if (!action) continue;

      const eligible = memberships.some((m) =>
        roleHasActions(m.role, [action]),
      );
      if (!eligible) continue;

      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        description: a.description,
        icon: a.icon,
        dismissButtonLabel: a.dismissButtonLabel,
        requiredAction: action,
      };
    }

    return null;
  },
);

export const markFeatureAnnouncementSeen = actionClient
  .inputSchema(z.object({ announcementId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    await db
      .insert(userFeatureAnnouncementState)
      .values({
        userId: session.user.id,
        announcementId: parsedInput.announcementId,
        seenAt: new Date(),
      })
      .onConflictDoNothing({
        target: [
          userFeatureAnnouncementState.userId,
          userFeatureAnnouncementState.announcementId,
        ],
      });

    return { success: true };
  });
