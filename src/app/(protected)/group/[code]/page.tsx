import { getGroupDetails } from "@/actions/group/detail";
import { redirect } from "next/navigation";

type GroupPageProps = {
  params: Promise<{ code: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { code } = await params;
  const { data: group } = await getGroupDetails({ code });

  if (!group) {
    return null;
  }

  // await auth.api.setActiveOrganization({
  //   headers: await headers(),
  //   body: { organizationId: group.id },
  // });

  return redirect(`/group/${code}/dashboard`);
}
