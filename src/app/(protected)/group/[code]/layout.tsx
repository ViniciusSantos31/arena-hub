import { getGroupDetails } from "@/actions/group/detail";
import { getUserMembershipStatus } from "@/actions/group/membership";
import { notFound, redirect, RedirectType } from "next/navigation";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../_components/page-structure";
import { GroupNav } from "./_components/group-nav";

export default async function GroupDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const group = await getGroupDetails({ code });

  if (!group.data) return notFound();

  const userIsMember = await getUserMembershipStatus({
    organizationId: group.data.id,
  });

  if (!userIsMember.data) return redirect("/home", RedirectType.replace);

  const { name } = group.data;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title={name} />
      </PageHeader>
      <PageContent className="relative h-full *:first:mb-4">
        {children}
        <GroupNav code={code} />
      </PageContent>
    </PageContainer>
  );
}
