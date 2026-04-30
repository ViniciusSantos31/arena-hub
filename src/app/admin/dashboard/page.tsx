import { listAdminGroups } from "@/actions/admin/groups/list";
import { adminOverview } from "@/actions/admin/overview";
import { GroupAdminCard } from "@/app/admin/_componentes/groups/group-admin-card";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircleIcon,
  LockIcon,
  PlayIcon,
  SwordsIcon,
  UsersIcon,
} from "lucide-react";
import { OverviewActivityChart } from "./_components/overview-activity-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const overview = await adminOverview();
  const groups = await listAdminGroups();

  if (overview.serverError && !overview.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar dados
        </h2>
        <p className="text-muted-foreground">
          Ocorreu um erro ao buscar os dados para o dashboard. Por favor, tente
          novamente mais tarde.
        </p>
      </div>
    );
  }

  const data = overview.data;
  const activeGroups = (groups.data?.groups ?? []).slice(0, 6);

  return (
    <div className="flex-1 space-y-6">
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <OverviewActivityChart data={data?.activitySeries ?? []} />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
          <MetricCard
            title="Usuários"
            value={data?.totals.users ?? 0}
            description="Total cadastrados"
            icon={UsersIcon}
          />
          <MetricCard
            title="Grupos"
            value={data?.totals.groups ?? 0}
            description={`${data?.groups.public ?? 0} públicos · ${
              data?.groups.private ?? 0
            } privados`}
            icon={LockIcon}
          />
          <MetricCard
            title="Membros"
            value={data?.totals.members ?? 0}
            description="Vínculos em grupos"
            icon={UsersIcon}
          />
          <MetricCard
            title="Partidas"
            value={data?.totals.matches ?? 0}
            description="Total criadas"
            icon={SwordsIcon}
          />
        </div>
        <Card className="border-border/60 lg:col-span-full">
          <CardHeader>
            <CardTitle className="text-base">Status das partidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex flex-wrap gap-2 *:data-[slot=badge]:px-4 *:data-[slot=badge]:py-2">
              <Badge className="gap-1" variant="secondary">
                <PlayIcon className="h-3.5 w-3.5" />
                Abertas {data?.matchesByStatus.open_registration ?? 0}
              </Badge>
              <Badge className="gap-1" variant="outline">
                Agendadas {data?.matchesByStatus.scheduled ?? 0}
              </Badge>
              <Badge className="gap-1" variant="outline">
                Inscrições fechadas{" "}
                {data?.matchesByStatus.closed_registration ?? 0}
              </Badge>
              <Badge className="gap-1" variant="outline">
                Times sorteados {data?.matchesByStatus.team_sorted ?? 0}
              </Badge>
              <Badge className="gap-1">
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Concluídas {data?.matchesByStatus.completed ?? 0}
              </Badge>
              <Badge className="gap-1" variant="destructive">
                Canceladas {data?.matchesByStatus.cancelled ?? 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Grupos mais ativos</h2>
          <p className="text-muted-foreground text-xs">
            Ordenado por última atividade
          </p>
        </div>
        {groups.serverError && !groups.data ? (
          <div className="text-muted-foreground text-sm">
            Não foi possível carregar os grupos.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeGroups.map((g) => (
              <GroupAdminCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
