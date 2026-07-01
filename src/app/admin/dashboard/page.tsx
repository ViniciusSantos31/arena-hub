import { adminExecutiveMetrics } from "@/actions/admin/executive-metrics";
import { listAdminGroups } from "@/actions/admin/groups/list";
import { GroupAdminCard } from "@/app/admin/_components/groups/group-admin-card";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { PLAN_TIER_LABELS } from "@/lib/user-plan/plan-tiers";
import {
  BellIcon,
  CreditCardIcon,
  PercentIcon,
  MessageSquareIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import { AdminAlerts } from "./_components/admin-alerts";
import { AdminDashboardClient } from "./_components/admin-dashboard-client";
import { OverviewActivityChart } from "./_components/overview-activity-chart";

export const dynamic = "force-dynamic";

const VALID_DAYS = [7, 30, 90] as const;

function parseDays(value: string | undefined): (typeof VALID_DAYS)[number] {
  const parsed = Number(value);
  if (VALID_DAYS.includes(parsed as (typeof VALID_DAYS)[number])) {
    return parsed as (typeof VALID_DAYS)[number];
  }
  return 30;
}

function formatBrlCents(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = parseDays(daysParam);

  const [metricsResult, groupsResult] = await Promise.all([
    adminExecutiveMetrics({ days }),
    listAdminGroups(),
  ]);

  if (metricsResult.serverError && !metricsResult.data) {
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

  const data = metricsResult.data;
  const activeGroups = (groupsResult.data?.groups ?? []).slice(0, 6);

  const tierDescription = data
    ? `${PLAN_TIER_LABELS.basic} ${data.subscribers.byTier.basic} · ${PLAN_TIER_LABELS.intermediate} ${data.subscribers.byTier.intermediate} · ${PLAN_TIER_LABELS.premium} ${data.subscribers.byTier.premium}`
    : undefined;

  return (
    <AdminDashboardClient days={days}>
      {data && (
        <AdminAlerts
          pendingFeedbacks={data.pendingFeedbacks}
          pastDue={data.subscribers.pastDue}
          alerts={data.alerts}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <MetricCard
          title="Usuários ativos (7d)"
          value={data?.activeUsers.d7 ?? 0}
          description="Jogaram ou criaram partidas"
          icon={UserCheckIcon}
        />
        <MetricCard
          title="Usuários ativos (30d)"
          value={data?.activeUsers.d30 ?? 0}
          description="Jogaram ou criaram partidas"
          icon={UsersIcon}
        />
        <MetricCard
          title="Grupos ativos (7d)"
          value={data?.activeGroups.d7 ?? 0}
          description="Com partidas ou novos membros"
          icon={TrendingUpIcon}
        />
        <MetricCard
          title="Grupos ativos (30d)"
          value={data?.activeGroups.d30 ?? 0}
          description="Com partidas ou novos membros"
          icon={TrendingUpIcon}
        />
        <MetricCard
          title="Taxa de conclusão"
          value={`${data?.matchCompletionRate ?? 0}%`}
          description="Concluídas / (concluídas + canceladas)"
          icon={PercentIcon}
        />
        <MetricCard
          title="Assinantes ativos"
          value={data?.subscribers.active ?? 0}
          description={tierDescription}
          icon={CreditCardIcon}
          badge={
            (data?.subscribers.pastDue ?? 0) > 0
              ? {
                  text: `${data?.subscribers.pastDue} em atraso`,
                  variant: "destructive" as const,
                }
              : undefined
          }
        />
        <MetricCard
          title="MRR estimado"
          value={formatBrlCents(data?.mrrEstimatedCents ?? 0)}
          description="Assinantes active/trialing"
          icon={CreditCardIcon}
        />
        <MetricCard
          title="Early adopters"
          value={data?.earlyAdopters ?? 0}
          description="Usuários com benefício especial"
          icon={SparklesIcon}
        />
        <MetricCard
          title="Feedbacks pendentes"
          value={data?.pendingFeedbacks ?? 0}
          description="Aguardando moderação"
          icon={MessageSquareIcon}
        />
        <MetricCard
          title="Push subscriptions"
          value={data?.pushSubscriptions ?? 0}
          description="Dispositivos registrados"
          icon={BellIcon}
        />
        <MetricCard
          title="Média de membros/grupo"
          value={data?.avgMembersPerGroup ?? 0}
          description="Total de vínculos / grupos"
          icon={UsersIcon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-full">
          <OverviewActivityChart
            data={data?.activitySeries ?? []}
            days={days}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Grupos mais ativos</h2>
          <p className="text-muted-foreground text-xs">
            Ordenado por última atividade
          </p>
        </div>
        {groupsResult.serverError && !groupsResult.data ? (
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
    </AdminDashboardClient>
  );
}
