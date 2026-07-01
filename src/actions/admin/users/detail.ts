"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { feedbackTable } from "@/db/schema/feedback";
import { matchesTable } from "@/db/schema/match";
import { member } from "@/db/schema/member";
import { playersTable } from "@/db/schema/player";
import {
  tutorialSections,
  userTutorialProgress,
} from "@/db/schema/tutorial";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { assertAdmin } from "@/lib/admin/assert-admin";
import { actionClient } from "@/lib/next-safe-action";
import { getUserPlanContext } from "@/lib/user-plan/get-user-plan-context";
import { isSubscriptionEffectivelyActive } from "@/lib/user-plan/subscription-status";
import type { PlanTier } from "@/lib/user-plan/types";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import type { TutorialProgressStatus } from "./list";

export interface AdminUserDetail {
  profile: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
    location: string | null;
    emailVerified: boolean;
    isEarlyAdopter: boolean;
    lookingForGroup: boolean;
    createdAt: string;
    updatedAt: string;
    stripeBillingCustomerId: string | null;
    earlyAdopterGrantedAt: string | null;
  };
  planContext: {
    isEarlyAdopter: boolean;
    ownedGroups: number;
    activeInviteLinks: number;
    limits: {
      maxGroups: number;
      maxMembersPerGroup: number | null;
      maxInviteLinksTotal: number | null;
    };
  };
  ownedGroups: Array<{
    id: string;
    code: string;
    name: string;
    private: boolean;
    memberCount: number;
    joinedAt: string;
  }>;
  memberGroups: Array<{
    id: string;
    code: string;
    name: string;
    private: boolean;
    role: string;
    joinedAt: string;
  }>;
  subscription: {
    planTier: PlanTier;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    gracePeriodEndsAt: string | null;
    stripeSubscriptionId: string;
    isEffectivelyActive: boolean;
  } | null;
  tutorial: {
    progress: TutorialProgressStatus;
    completedSections: number;
    totalSections: number;
    sections: Array<{
      id: string;
      title: string;
      isCompleted: boolean;
    }>;
  };
  feedbacks: Array<{
    id: string;
    rating: number;
    message: string;
    isApproved: boolean;
    createdAt: string;
  }>;
  recentMatches: Array<{
    id: string;
    title: string;
    status: string;
    date: string;
    sport: string;
    category: string;
    groupCode: string | null;
    groupName: string | null;
    confirmed: boolean;
  }>;
}

async function resolveTutorialDetail(userId: string) {
  const [sections, progressRows] = await Promise.all([
    db.query.tutorialSections.findMany({
      where: eq(tutorialSections.isActive, true),
      columns: { id: true, title: true },
      orderBy: (s, { asc }) => [asc(s.order)],
    }),
    db.query.userTutorialProgress.findMany({
      where: and(
        eq(userTutorialProgress.userId, userId),
        eq(userTutorialProgress.isCompleted, true),
      ),
      columns: { sectionId: true },
    }),
  ]);

  const completedSectionIds = new Set(progressRows.map((p) => p.sectionId));
  const sectionItems = sections.map((section) => ({
    id: section.id,
    title: section.title,
    isCompleted: completedSectionIds.has(section.id),
  }));

  const totalSections = sections.length;
  const completedSections = sectionItems.filter((s) => s.isCompleted).length;

  let progress: TutorialProgressStatus = "not_started";
  if (progressRows.length > 0) {
    if (totalSections === 0 || completedSections >= totalSections) {
      progress = "completed";
    } else {
      progress = "in_progress";
    }
  }

  return {
    progress,
    completedSections,
    totalSections,
    sections: sectionItems,
  };
}

export const getAdminUserDetail = actionClient
  .inputSchema(z.object({ userId: z.string().min(1) }))
  .action(async ({ parsedInput }) => {
    await assertAdmin();

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, parsedInput.userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        emailVerified: true,
        isEarlyAdopter: true,
        lookingForGroup: true,
        createdAt: true,
        updatedAt: true,
        stripeBillingCustomerId: true,
        earlyAdopterGrantedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    const [
      memberships,
      billingSubscription,
      feedbacks,
      recentMatchRows,
      planContext,
      tutorial,
    ] = await Promise.all([
      db.query.member.findMany({
        where: eq(member.userId, parsedInput.userId),
        columns: { id: true, role: true, createdAt: true, organizationId: true },
        with: {
          organization: {
            columns: { id: true, code: true, name: true, private: true },
            with: {
              members: {
                columns: { id: true },
              },
            },
          },
        },
      }),
      db.query.userBillingSubscription.findFirst({
        where: eq(userBillingSubscription.userId, parsedInput.userId),
      }),
      db.query.feedbackTable.findMany({
        where: eq(feedbackTable.userId, parsedInput.userId),
        columns: {
          id: true,
          rating: true,
          message: true,
          isApproved: true,
          createdAt: true,
        },
        orderBy: (f, { desc: descFn }) => [descFn(f.createdAt)],
      }),
      db
        .select({
          matchId: matchesTable.id,
          title: matchesTable.title,
          status: matchesTable.status,
          date: matchesTable.date,
          sport: matchesTable.sport,
          category: matchesTable.category,
          groupCode: organization.code,
          groupName: organization.name,
          confirmed: playersTable.confirmed,
        })
        .from(playersTable)
        .innerJoin(matchesTable, eq(playersTable.matchId, matchesTable.id))
        .leftJoin(organization, eq(matchesTable.organizationId, organization.id))
        .where(eq(playersTable.userId, parsedInput.userId))
        .orderBy(desc(matchesTable.date))
        .limit(10),
      getUserPlanContext(parsedInput.userId),
      resolveTutorialDetail(parsedInput.userId),
    ]);

    const ownedGroups = memberships
      .filter((m) => m.role === "owner")
      .map((m) => ({
        id: m.organization.id,
        code: m.organization.code,
        name: m.organization.name,
        private: m.organization.private,
        memberCount: m.organization.members.length,
        joinedAt: m.createdAt.toISOString(),
      }))
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

    const memberGroups = memberships
      .filter((m) => m.role !== "owner")
      .map((m) => ({
        id: m.organization.id,
        code: m.organization.code,
        name: m.organization.name,
        private: m.organization.private,
        role: m.role ?? "member",
        joinedAt: m.createdAt.toISOString(),
      }))
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt));

    const subscription = billingSubscription
      ? {
          planTier: billingSubscription.planTier as PlanTier,
          status: billingSubscription.status,
          currentPeriodStart: billingSubscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: billingSubscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: billingSubscription.cancelAtPeriodEnd,
          gracePeriodEndsAt:
            billingSubscription.gracePeriodEndsAt?.toISOString() ?? null,
          stripeSubscriptionId: billingSubscription.stripeSubscriptionId,
          isEffectivelyActive:
            isSubscriptionEffectivelyActive(billingSubscription),
        }
      : null;

    const detail: AdminUserDetail = {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        bio: user.bio ?? null,
        location: user.location ?? null,
        emailVerified: user.emailVerified,
        isEarlyAdopter: user.isEarlyAdopter,
        lookingForGroup: user.lookingForGroup,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        stripeBillingCustomerId: user.stripeBillingCustomerId ?? null,
        earlyAdopterGrantedAt: user.earlyAdopterGrantedAt?.toISOString() ?? null,
      },
      planContext: {
        isEarlyAdopter: planContext.isEarlyAdopter,
        ownedGroups: planContext.usage.ownedGroups,
        activeInviteLinks: planContext.usage.activeInviteLinks,
        limits: planContext.limits,
      },
      ownedGroups,
      memberGroups,
      subscription,
      tutorial,
      feedbacks: feedbacks.map((f) => ({
        id: f.id,
        rating: f.rating,
        message: f.message,
        isApproved: f.isApproved,
        createdAt: f.createdAt.toISOString(),
      })),
      recentMatches: recentMatchRows.map((row) => ({
        id: row.matchId,
        title: row.title,
        status: row.status,
        date: row.date.toISOString(),
        sport: row.sport,
        category: row.category,
        groupCode: row.groupCode ?? null,
        groupName: row.groupName ?? null,
        confirmed: row.confirmed,
      })),
    };

    return detail;
  });
