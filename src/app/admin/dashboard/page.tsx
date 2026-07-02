import { adminExecutiveMetrics } from "@/actions/admin/executive-metrics";
import { listAdminGroups } from "@/actions/admin/groups/list";
import { AdminSection } from "@/app/admin/_components/admin-section";
import { GroupAdminCard } from "@/app/admin/_components/groups/group-admin-card";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Button } from "@/components/ui/button";
import { PLAN_TIER_LABELS } from "@/lib/user-plan/plan-tiers";
import {
  BellIcon,
  CreditCardIcon,
  MessageSquareIcon,
  PercentIcon,
  SparklesIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
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

  console.log(metricsResult);
  console.log(groupsResult);

  if (metricsResult.serverError && !metricsResult.data) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center"
        role="alert"
      >
        <h2 className="text-xl font-semibold tracking-tight">
          Erro ao carregar dados
        </h2>
        <p className="text-muted-foreground max-w-md text-sm">
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

      <AdminSection
        id="resumo"
        title="Resumo executivo"
        description="Indicadores principais da plataforma nos últimos 30 dias"
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            variant="hero"
            title="Usuários ativos (30d)"
            value={data?.activeUsers.d30 ?? 0}
            description="Jogaram ou criaram partidas"
            icon={UsersIcon}
          />
          <MetricCard
            variant="hero"
            title="Grupos ativos (30d)"
            value={data?.activeGroups.d30 ?? 0}
            description="Com partidas ou novos membros"
            icon={TrendingUpIcon}
          />
          <MetricCard
            variant="hero"
            title="MRR estimado"
            value={formatBrlCents(data?.mrrEstimatedCents ?? 0)}
            description="Assinantes active/trialing"
            icon={CreditCardIcon}
          />
          <MetricCard
            variant="hero"
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
        </div>
      </AdminSection>

      <OverviewActivityChart data={data?.activitySeries ?? []} days={days} />

      <AdminSection
        id="engajamento"
        title="Engajamento"
        description="Atividade de usuários, grupos e partidas"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Usuários ativos (7d)"
            value={data?.activeUsers.d7 ?? 0}
            description="Jogaram ou criaram partidas"
            icon={UserCheckIcon}
          />
          <MetricCard
            title="Grupos ativos (7d)"
            value={data?.activeGroups.d7 ?? 0}
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
            title="Média de membros/grupo"
            value={data?.avgMembersPerGroup ?? 0}
            description="Total de vínculos / grupos"
            icon={UsersIcon}
          />
        </div>
      </AdminSection>

      <AdminSection
        id="suporte"
        title="Suporte e comunidade"
        description="Feedbacks, early adopters e notificações push"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Feedbacks pendentes"
            value={data?.pendingFeedbacks ?? 0}
            description="Aguardando moderação"
            icon={MessageSquareIcon}
          />
          <MetricCard
            title="Early adopters"
            value={data?.earlyAdopters ?? 0}
            description="Usuários com benefício especial"
            icon={SparklesIcon}
          />
          <MetricCard
            title="Push subscriptions"
            value={data?.pushSubscriptions ?? 0}
            description="Dispositivos registrados"
            icon={BellIcon}
          />
        </div>
      </AdminSection>

      <AdminSection
        id="grupos-ativos"
        title="Grupos mais ativos"
        description="Ordenado por última atividade"
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/groups">Ver todos</Link>
          </Button>
        }
      >
        {groupsResult.serverError && !groupsResult.data ? (
          <p className="text-muted-foreground text-sm" role="status">
            Não foi possível carregar os grupos.
          </p>
        ) : activeGroups.length === 0 ? (
          <p className="text-muted-foreground text-sm" role="status">
            Nenhum grupo encontrado.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeGroups.map((g) => (
              <GroupAdminCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </AdminSection>
    </AdminDashboardClient>
  );
}
