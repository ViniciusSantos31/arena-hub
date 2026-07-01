import { adminGrowthMetrics } from "@/actions/admin/growth/metrics";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { MetricCard } from "@/app/admin/_components/metric-card";
import {
  LinkIcon,
  PercentIcon,
  SearchIcon,
  SendIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { GrowthDashboardClient } from "./_components/growth-dashboard-client";

export const dynamic = "force-dynamic";

const VALID_DAYS = [7, 30, 90] as const;

function parseDays(value: string | undefined): (typeof VALID_DAYS)[number] {
  const parsed = Number(value);
  if (VALID_DAYS.includes(parsed as (typeof VALID_DAYS)[number])) {
    return parsed as (typeof VALID_DAYS)[number];
  }
  return 30;
}

function formatProviderLabel(providerId: string): string {
  const labels: Record<string, string> = {
    google: "Google",
    credential: "Email/senha",
    github: "GitHub",
    apple: "Apple",
  };
  return labels[providerId] ?? providerId;
}

export default async function AdminGrowthPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysParam } = await searchParams;
  const days = parseDays(daysParam);

  const metricsResult = await adminGrowthMetrics({ days });

  if (metricsResult.serverError && !metricsResult.data) {
    return (
      <PageContainer>
        <PageContent>
          <div className="flex-1 items-center justify-center space-y-6 p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Erro ao carregar crescimento
            </h2>
            <p className="text-muted-foreground">
              Não foi possível buscar as métricas de aquisição. Tente novamente.
            </p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const data = metricsResult.data;
  const providerEntries = Object.entries(data?.newUsersByProvider ?? {}).sort(
    (a, b) => b[1] - a[1],
  );
  const providerDescription =
    providerEntries.length > 0
      ? providerEntries
          .map(([provider, count]) => `${formatProviderLabel(provider)}: ${count}`)
          .join(" · ")
      : "Nenhum cadastro no período";

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Crescimento"
          description="Canais de aquisição, convites e pedidos de entrada"
        />
      </PageHeader>
      <PageContent>
        <GrowthDashboardClient days={days}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <MetricCard
              title="Links criados"
              value={data?.inviteLinks.created ?? 0}
              description="Links de convite no período"
              icon={LinkIcon}
            />
            <MetricCard
              title="Links revogados"
              value={data?.inviteLinks.revoked ?? 0}
              description="Revogados no período"
              icon={LinkIcon}
            />
            <MetricCard
              title="Links consumidos"
              value={data?.inviteLinks.consumed ?? 0}
              description="Usos registrados no período"
              icon={UserPlusIcon}
            />
            <MetricCard
              title="Taxa de conversão"
              value={`${data?.inviteLinks.conversionRate ?? 0}%`}
              description="Consumidos / criados no período"
              icon={PercentIcon}
            />
            <MetricCard
              title="Convites diretos"
              value={data?.directInvitesSent ?? 0}
              description="Enviados no período"
              icon={SendIcon}
            />
            <MetricCard
              title="Pedidos submetidos"
              value={data?.joinRequests.submitted ?? 0}
              description="Solicitações de entrada"
              icon={UsersIcon}
            />
            <MetricCard
              title="Pedidos aprovados"
              value={data?.joinRequests.approved ?? 0}
              description="Aprovados no período"
              icon={UsersIcon}
            />
            <MetricCard
              title="Pedidos rejeitados"
              value={data?.joinRequests.rejected ?? 0}
              description="Rejeitados no período"
              icon={UsersIcon}
            />
            <MetricCard
              title="LFG ativo"
              value={data?.lfgActiveUsers ?? 0}
              description="Usuários buscando grupo agora"
              icon={SearchIcon}
            />
            <MetricCard
              title="Novos usuários por provider"
              value={providerEntries.reduce((sum, [, count]) => sum + count, 0)}
              description={providerDescription}
              icon={UserPlusIcon}
            />
          </div>
        </GrowthDashboardClient>
      </PageContent>
    </PageContainer>
  );
}
