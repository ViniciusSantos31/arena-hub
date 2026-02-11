import { getGroupDetails } from "@/actions/group/detail";
import { getUserMembership } from "@/actions/group/membership";
import { can } from "@/hooks/use-guard";
import { Role } from "@/utils/role";
import { redirect } from "next/navigation";
import { LoadingGroupPage } from "../_components/loading-page";
import { GroupSettingsForm } from "./_components/group-settings-form";

type GroupSettingsPageProps = {
  params: Promise<{ code: string }>;
};

export default async function GroupSettingsPage({
  params,
}: GroupSettingsPageProps) {
  const { code } = await params;

  const [groupResult, membershipResult] = await Promise.all([
    getGroupDetails({ code }),
    getUserMembership({ organizationCode: code }),
  ]);

  const group = groupResult.data;
  const membership = membershipResult.data;

  if (!group || !membership) {
    return <LoadingGroupPage />;
  }

  const canAccessSetting = can(membership, ["group:settings"]);

  if (!canAccessSetting) {
    return redirect(`/group/${code}/dashboard`);
  }

  return <GroupSettingsForm group={group} userRole={membership.role as Role} />;
}
