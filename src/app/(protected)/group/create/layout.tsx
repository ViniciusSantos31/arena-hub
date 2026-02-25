import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../../(protected)/_components/page-structure";
import { GroupLimitDialog } from "./_components/group-limit-dialog";

export default async function CreateGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const groups = await auth.api.listOrganizations({
    headers: await headers(),
  });
  const groupsCount = groups.length;

  return (
    <PageContainer>
      <GroupLimitDialog groupsCount={groupsCount} />
      <PageHeader>
        <PageHeaderContent title="Criar grupo" />
      </PageHeader>
      <PageContent className="relative">{children}</PageContent>
    </PageContainer>
  );
}
