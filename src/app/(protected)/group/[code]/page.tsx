import { getGroupDetails } from "@/actions/group/detail";
import { redirect } from "next/navigation";
import { LoadingGroupPage } from "./_components/loading-page";

type GroupPageProps = {
  params: Promise<{ code: string }>;
};

export default async function GroupPage({ params }: GroupPageProps) {
  const { code } = await params;
  const { data: group } = await getGroupDetails({ code });

  if (!group) {
    return <LoadingGroupPage />;
  }

  return redirect(`/group/${code}/dashboard`);
}
