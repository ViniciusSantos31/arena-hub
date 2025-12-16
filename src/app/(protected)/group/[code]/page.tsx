import { getGroupDetails } from "@/actions/group/detail";
import { auth } from "@/lib/auth";
import { permanentRedirect } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ code: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { code } = await params;
  const { data: group } = await getGroupDetails({ code });

  if (!group) {
    return null;
  }

  await auth.api.setActiveOrganization({
    body: { organizationId: group.id },
  });

  return permanentRedirect(`/group/${code}/dashboard`);
}
