"use client";

import { getGroupDetails } from "@/actions/group/detail";
import { getUserMembership } from "@/actions/group/membership";
import UnauthorizedPage from "@/app/unauthorized";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSelectedLayoutSegments } from "next/navigation";
import { use } from "react";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../_components/page-structure";
import { GroupDetailsDrawer } from "./_components/group-details-drawer";
import { GroupNav } from "./_components/group-nav";
import { LoadingGroupPage } from "./_components/loading-page";
import { useMemberStore } from "./_store/group";

export default function GroupDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const memberStore = useMemberStore();
  const segments = useSelectedLayoutSegments();
  const isMembersSegment = segments.includes("members");

  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["group-details", code],
    enabled: !!code,
    queryFn: () => getGroupDetails({ code }).then((res) => res.data),
  });

  const { data: membership, isLoading: isLoadingMembership } = useQuery({
    queryKey: ["user-membership", code],
    enabled: !!code,
    queryFn: async () => {
      const membership = await getUserMembership({ organizationCode: code });
      if (
        membership.data &&
        (!memberStore.member ||
          memberStore.member.organizationId !== membership.data.organizationId)
      ) {
        memberStore.setMember(membership.data);
      }

      return membership.data;
    },
  });

  const { name } = group || { name: "" };

  if (isLoadingGroup || isLoadingMembership) {
    return <LoadingGroupPage />;
  }

  if (!membership && !isLoadingMembership) return <UnauthorizedPage />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title={name} />
        <GroupDetailsDrawer
          group={{
            name: group?.name ?? name,
            code,
            description: group?.description,
            logo: group?.logo,
            rules: group?.rules,
          }}
          memberRole={
            membership && typeof membership !== "boolean"
              ? (membership.role ?? "member")
              : "member"
          }
        />
      </PageHeader>
      <PageContent
        className={cn(
          "relative h-full *:first:mb-4",
          isMembersSegment && "scrollbar-none overflow-y-auto px-0 pt-0 pr-0!",
        )}
      >
        {children}
        <GroupNav code={code} />
      </PageContent>
    </PageContainer>
  );
}
