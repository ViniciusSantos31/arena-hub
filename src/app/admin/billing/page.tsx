import { adminBillingMetrics } from "@/actions/admin/billing/metrics";
import { listAdminSubscriptions } from "@/actions/admin/billing/subscriptions";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { BillingDashboard } from "@/app/admin/billing/_components/subscriptions-table";

export const dynamic = "force-dynamic";

const DEFAULT_PERIOD_DAYS = 30;

export default async function AdminBillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const periodDays = Number(params.periodDays) || DEFAULT_PERIOD_DAYS;

  const [metricsResult, subscriptionsResult] = await Promise.all([
    adminBillingMetrics({ periodDays }),
    listAdminSubscriptions({ page, pageSize: 20 }),
  ]);

  if (
    (metricsResult.serverError && !metricsResult.data) ||
    (subscriptionsResult.serverError && !subscriptionsResult.data)
  ) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar billing
        </h2>
        <p className="text-muted-foreground">
          Não foi possível buscar as métricas ou assinaturas. Tente novamente.
        </p>
      </div>
    );
  }

  const metrics = metricsResult.data ?? {
    mrrEstimatedCents: 0,
    subscribersByTier: { basic: 0, intermediate: 0, premium: 0 },
    newSubscriptions: 0,
    cancellations: 0,
    pastDue: 0,
    cancelAtPeriodEnd: 0,
    earlyAdoptersWithoutPlan: 0,
    statusDistribution: {},
  };

  const subscriptions = subscriptionsResult.data ?? {
    items: [],
    page,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Billing"
          description="MRR, assinaturas e sinais de churn da plataforma"
        />
      </PageHeader>
      <PageContent>
        <BillingDashboard
          initialMetrics={metrics}
          initialPeriodDays={periodDays}
          subscriptions={{
            initialData: subscriptions,
          }}
        />
      </PageContent>
    </PageContainer>
  );
}
