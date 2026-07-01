import { listAdminGroups } from "@/actions/admin/groups/list";
import { listAdminMatches } from "@/actions/admin/matches/list";
import { AdminPageShell } from "@/app/admin/_components/admin-page-shell";
import { MatchesTable } from "@/app/admin/matches/_components/matches-table";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [matchesResult, groupsResult] = await Promise.all([
    listAdminMatches({
      page: 1,
      pageSize: 20,
    }),
    listAdminGroups(),
  ]);

  if (matchesResult.serverError && !matchesResult.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar partidas
        </h2>
        <p className="text-muted-foreground">
          Não foi possível buscar as métricas ou listagem. Tente novamente.
        </p>
      </div>
    );
  }

  const data = matchesResult.data ?? {
    metrics: {
      byStatus: {
        scheduled: 0,
        open_registration: 0,
        closed_registration: 0,
        team_sorted: 0,
        completed: 0,
        cancelled: 0,
      },
      bySportCategory: [],
      fillRate: 0,
      cancellationRate: 0,
      avgCompletionTimeHours: null,
      topGroups: [],
    },
    list: {
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      totalPages: 1,
    },
  };

  const organizations = (groupsResult.data?.groups ?? []).map((group) => ({
    id: group.id,
    name: group.name,
    code: group.code,
  }));

  return (
    <AdminPageShell
      title="Partidas"
      description="Métricas operacionais e listagem global de partidas"
    >
      <MatchesTable
        initialData={data}
        initialFilters={{
          page: 1,
          pageSize: 20,
        }}
        organizations={organizations}
      />
    </AdminPageShell>
  );
}
