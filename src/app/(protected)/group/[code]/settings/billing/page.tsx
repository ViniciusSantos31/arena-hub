import { getRecipient } from "@/actions/payment/get-recipient";
import { getUserMembership } from "@/actions/group/membership";
import { can } from "@/hooks/use-guard";
import { redirect } from "next/navigation";
import { LoadingGroupPage } from "../../_components/loading-page";
import { BalanceCard } from "./_components/balance-card";
import { BillingSetupCard } from "./_components/billing-setup-card";
import { MembershipPlanCard } from "./_components/membership-plan-card";

type BillingPageProps = {
  params: Promise<{ code: string }>;
};

export default async function BillingPage({ params }: BillingPageProps) {
  const { code } = await params;

  const [membershipResult, recipientResult] = await Promise.all([
    getUserMembership({ organizationCode: code }),
    getRecipient({ organizationCode: code }),
  ]);

  const membership = membershipResult.data;

  if (!membership) {
    return <LoadingGroupPage />;
  }

  const canAccessSetting = can(membership, ["group:settings"]);

  if (!canAccessSetting) {
    return redirect(`/group/${code}/dashboard`);
  }

  const recipient = recipientResult.data;
  const recipientStatus = recipient?.status ?? null;

  return (
    <div className="space-y-4">
      <BillingSetupCard
        organizationCode={code}
        recipientStatus={recipientStatus}
      />
      {recipientStatus === "active" && (
        <>
          <BalanceCard organizationCode={code} />
          <MembershipPlanCard organizationCode={code} />
        </>
      )}
    </div>
  );
}
