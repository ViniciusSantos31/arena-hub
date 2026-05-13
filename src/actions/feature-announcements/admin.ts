"use server";

import { db } from "@/db";
import { featureAnnouncement, userFeatureAnnouncementState } from "@/db/schema/feature-announcement";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { count, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod/v4";
import { adminUpsertFeatureAnnouncementSchema } from "./_schema";

async function assertAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session || !session?.user) {
    throw new Error("Usuário não autenticado");
  }
  if (session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Acesso negado");
  }

  return session;
}

export const adminListFeatureAnnouncements = actionClient.action(async () => {
  await assertAdmin();

  const announcements = await db.query.featureAnnouncement.findMany({
    orderBy: [desc(featureAnnouncement.isActive), desc(featureAnnouncement.priority), desc(featureAnnouncement.createdAt)],
  });

  return { announcements };
});

export const adminCreateFeatureAnnouncement = actionClient
  .inputSchema(adminUpsertFeatureAnnouncementSchema)
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const created = await db
      .insert(featureAnnouncement)
      .values({
        ...parsedInput,
        updatedAt: new Date(),
      })
      .returning()
      .then((rows) => rows[0]);

    if (!created) {
      throw new Error("Falha ao criar novidade");
    }

    return { announcement: created };
  });

export const adminUpdateFeatureAnnouncement = actionClient
  .inputSchema(
    adminUpsertFeatureAnnouncementSchema.extend({
      id: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const { id, ...updateData } = parsedInput;

    const updated = await db
      .update(featureAnnouncement)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(featureAnnouncement.id, id))
      .returning()
      .then((rows) => rows[0]);

    if (!updated) {
      throw new Error("Novidade não encontrada");
    }

    return { announcement: updated };
  });

export const adminToggleFeatureAnnouncementActive = actionClient
  .inputSchema(z.object({ id: z.string().min(1), isActive: z.boolean() }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const updated = await db
      .update(featureAnnouncement)
      .set({
        isActive: parsedInput.isActive,
        updatedAt: new Date(),
      })
      .where(eq(featureAnnouncement.id, parsedInput.id))
      .returning()
      .then((rows) => rows[0]);

    if (!updated) {
      throw new Error("Novidade não encontrada");
    }

    return { announcement: updated };
  });

export const adminDeleteFeatureAnnouncement = actionClient
  .inputSchema(z.object({ id: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    await db.delete(featureAnnouncement).where(eq(featureAnnouncement.id, parsedInput.id));

    return { success: true };
  });

export const adminGetAnnouncementStats = actionClient
  .inputSchema(z.object({ announcementId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const viewsByGroup = await db
      .select({
        organizationId: organization.id,
        organizationName: organization.name,
        organizationCode: organization.code,
        viewCount: count(userFeatureAnnouncementState.userId),
      })
      .from(userFeatureAnnouncementState)
      .innerJoin(member, eq(member.userId, userFeatureAnnouncementState.userId))
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(eq(userFeatureAnnouncementState.announcementId, parsedInput.announcementId))
      .groupBy(organization.id, organization.name, organization.code)
      .orderBy(desc(count(userFeatureAnnouncementState.userId)));

    const totalViews = await db
      .select({ total: count() })
      .from(userFeatureAnnouncementState)
      .where(eq(userFeatureAnnouncementState.announcementId, parsedInput.announcementId))
      .then((rows) => rows[0]?.total ?? 0);

    return { totalViews, viewsByGroup };
  });

