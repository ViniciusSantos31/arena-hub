import { db } from "@/db";
import { organization, sessionsTable } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { pushSubscriptions } from "@/db/schema/subscription";
import { usersTable } from "@/db/schema/user";
import { userBillingSubscription } from "@/db/schema/user-billing";
import { stripe } from "@/lib/stripe";
import { countOwnedGroups } from "@/lib/user-plan/queries";
import { isSubscriptionEffectivelyActive } from "@/lib/user-plan/subscription-status";
import { and, eq, inArray } from "drizzle-orm";
import Stripe from "stripe";

export type AccountDeletionImpact = {
  ownedGroupsCount: number;
  hasActiveSubscription: boolean;
};

export async function getAccountDeletionImpact(
  userId: string,
): Promise<AccountDeletionImpact> {
  const [ownedGroupsCount, billing] = await Promise.all([
    countOwnedGroups(userId),
    db.query.userBillingSubscription.findFirst({
      where: eq(userBillingSubscription.userId, userId),
      columns: {
        status: true,
        gracePeriodEndsAt: true,
      },
    }),
  ]);

  return {
    ownedGroupsCount,
    hasActiveSubscription: billing
      ? isSubscriptionEffectivelyActive(billing)
      : false,
  };
}

async function cancelBillingSubscription(userId: string): Promise<void> {
  const billing = await db.query.userBillingSubscription.findFirst({
    where: eq(userBillingSubscription.userId, userId),
    columns: { stripeSubscriptionId: true },
  });

  if (!billing) {
    return;
  }

  try {
    await stripe.subscriptions.cancel(billing.stripeSubscriptionId);
  } catch (error) {
    if (
      error instanceof Stripe.errors.StripeError &&
      error.code === "resource_missing"
    ) {
      return;
    }

    throw error;
  }
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await cancelBillingSubscription(userId);

  await db.transaction(async (tx) => {
    const ownedMemberships = await tx.query.member.findMany({
      where: and(eq(member.userId, userId), eq(member.role, "owner")),
      columns: { organizationId: true },
    });

    const ownedOrganizationIds = ownedMemberships.map((m) => m.organizationId);

    if (ownedOrganizationIds.length > 0) {
      await tx
        .update(sessionsTable)
        .set({ activeOrganizationId: null })
        .where(
          inArray(sessionsTable.activeOrganizationId, ownedOrganizationIds),
        );

      await tx
        .delete(organization)
        .where(inArray(organization.id, ownedOrganizationIds));
    }

    await tx
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));

    const deleted = await tx
      .delete(usersTable)
      .where(eq(usersTable.id, userId))
      .returning({ id: usersTable.id });

    if (!deleted[0]) {
      throw new Error("Falha ao excluir conta");
    }
  });
}
