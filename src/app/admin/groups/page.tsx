import { listAdminGroups } from "@/actions/admin/groups/list";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { GroupsCardsGrid } from "@/app/admin/_componentes/groups/groups-cards-grid";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const groups = await listAdminGroups();

  if (groups.serverError && !groups.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar grupos
        </h2>
      </div>
    );
  }

  const groupsData = groups.data?.groups ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Grupos"
          description="Gerencie e acompanhe os grupos criados na plataforma"
        />
      </PageHeader>
      <PageContent>
        <GroupsCardsGrid groups={groupsData} />
      </PageContent>
    </PageContainer>
  );
}
