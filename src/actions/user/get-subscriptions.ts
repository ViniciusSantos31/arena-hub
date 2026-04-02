"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import {
  memberSubscriptionsTable,
  membershipPlansTable,
} from "@/db/schema/memberships";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export const getMySubscriptions = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const subscriptions = await db
    .select({
      id: memberSubscriptionsTable.id,
      status: memberSubscriptionsTable.status,
      currentPeriodStart: memberSubscriptionsTable.currentPeriodStart,
      currentPeriodEnd: memberSubscriptionsTable.currentPeriodEnd,
      cancelAtPeriodEnd: memberSubscriptionsTable.cancelAtPeriodEnd,
      cancelledAt: memberSubscriptionsTable.cancelledAt,
      stripeSubscriptionId: memberSubscriptionsTable.stripeSubscriptionId,
      organizationId: memberSubscriptionsTable.organizationId,
      groupName: organization.name,
      groupCode: organization.code,
      amountCents: membershipPlansTable.amountCents,
    })
    .from(memberSubscriptionsTable)
    .innerJoin(
      organization,
      eq(memberSubscriptionsTable.organizationId, organization.id),
    )
    .leftJoin(
      membershipPlansTable,
      and(
        eq(
          membershipPlansTable.organizationId,
          memberSubscriptionsTable.organizationId,
        ),
        eq(membershipPlansTable.isActive, true),
      ),
    )
    .where(eq(memberSubscriptionsTable.userId, session.user.id));

  return subscriptions;
});
