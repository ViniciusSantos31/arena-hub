import { listAllGroups } from "@/actions/group/list-all-groups";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";
import { GroupsClient } from "./_components/groups-client";

export default async function GroupsPage() {
  const result = await listAllGroups();
  const groups = result?.data ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Explorar grupos" />
      </PageHeader>
      <PageContent>
        <GroupsClient groups={groups} />
      </PageContent>
    </PageContainer>
  );
}
