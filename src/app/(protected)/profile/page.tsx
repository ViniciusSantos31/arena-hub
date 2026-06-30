import { listMyPendingInvites } from "@/actions/invite-links/list-pending-invites";
import { getMyProfile } from "@/actions/user/get-my-profile";
import { auth } from "@/lib/auth";
import { listSubscriptionPaymentsForUser } from "@/lib/stripe-billing/list-subscription-invoices";
import { getAccountDeletionImpact } from "@/lib/user-account/delete-user-account";
import { getSubscriptionSummaryForUser } from "@/lib/user-plan/subscription-summary";
import { headers } from "next/headers";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";
import { ProfileTabs } from "./_components/profile-tabs";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const defaultTab = tab === "subscription" ? "subscription" : "profile";

  const session = await auth.api.getSession({ headers: await headers() });

  const [
    profileResult,
    pendingInvitesResult,
    subscriptionSummary,
    subscriptionPayments,
    deletionImpact,
  ] = await Promise.all([
    getMyProfile(),
    listMyPendingInvites(),
    session?.user
      ? getSubscriptionSummaryForUser(session.user.id)
      : Promise.resolve(null),
    session?.user
      ? listSubscriptionPaymentsForUser(session.user.id)
      : Promise.resolve([]),
    session?.user
      ? getAccountDeletionImpact(session.user.id)
      : Promise.resolve({ ownedGroupsCount: 0, hasActiveSubscription: false }),
  ]);

  const user = session?.user;
  const data = profileResult?.data;
  const pendingInvites = pendingInvitesResult?.data ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Perfil" />
      </PageHeader>
      <PageContent className="p-0">
        <ProfileTabs
          defaultTab={defaultTab}
          user={user}
          profileData={data}
          pendingInvites={pendingInvites}
          subscriptionSummary={subscriptionSummary}
          subscriptionPayments={subscriptionPayments}
          deletionImpact={deletionImpact}
        />
      </PageContent>
    </PageContainer>
  );
}
