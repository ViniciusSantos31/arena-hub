import { listAdminGroups } from "@/actions/admin/groups/list";
import { AdminPageShell } from "@/app/admin/_components/admin-page-shell";
import { GroupsCardsGrid } from "@/app/admin/_components/groups/groups-cards-grid";

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
    <AdminPageShell
      title="Grupos"
      description="Gerencie e acompanhe os grupos criados na plataforma"
    >
      <GroupsCardsGrid groups={groupsData} />
    </AdminPageShell>
  );
}
