"use client";

import type { AdminBillingMetricsData } from "@/actions/admin/billing/metrics";
import { adminBillingMetrics } from "@/actions/admin/billing/metrics";
import type { AdminSubscriptionListItem } from "@/actions/admin/billing/subscriptions";
import {
  listAdminSubscriptions,
  type ListAdminSubscriptionsInput,
} from "@/actions/admin/billing/subscriptions";
import { AdminDataTable } from "@/app/admin/_components/admin-data-table";
import { AdminDateRangeFilter } from "@/app/admin/_components/admin-date-range-filter";
import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaginatedResponse } from "@/lib/admin/types";
import { stripeSubscriptionDashboardUrl } from "@/lib/admin/stripe-links";
import { PLAN_TIER_LABELS, PLAN_TIERS } from "@/lib/user-plan/plan-tiers";
import { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangleIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  UserMinusIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";

const SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
] as const;

const STATUS_LABELS: Record<(typeof SUBSCRIPTION_STATUSES)[number], string> = {
  active: "Ativo",
  trialing: "Teste",
  past_due: "Pendente",
  canceled: "Cancelado",
  incomplete: "Incompleto",
  incomplete_expired: "Expirado",
  unpaid: "Não pago",
};

function formatCurrencyFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDatePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function tierDistributionDescription(
  subscribersByTier: AdminBillingMetricsData["subscribersByTier"],
) {
  return PLAN_TIERS.map(
    (tier) => `${PLAN_TIER_LABELS[tier]}: ${subscribersByTier[tier]}`,
  ).join(" · ");
}

const columns: ColumnDef<AdminSubscriptionListItem>[] = [
  {
    accessorKey: "userName",
    header: "Usuário",
    cell: ({ row }) => {
      const item = row.original;
      return (
        <Link
          href={`/admin/users/${item.userId}`}
          className="font-medium hover:underline"
        >
          {item.userName}
        </Link>
      );
    },
  },
  {
    accessorKey: "userEmail",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.original.userEmail}</span>
    ),
  },
  {
    accessorKey: "planTier",
    header: "Plano",
    cell: ({ row }) => PLAN_TIER_LABELS[row.original.planTier],
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const variant =
        status === "active"
          ? "default"
          : status === "past_due"
            ? "destructive"
            : "outline";
      return (
        <Badge variant={variant}>
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "currentPeriodStart",
    header: "Período",
    cell: ({ row }) => (
      <span className="text-sm whitespace-nowrap">
        {formatDatePtBr(row.original.currentPeriodStart)} –{" "}
        {formatDatePtBr(row.original.currentPeriodEnd)}
      </span>
    ),
  },
  {
    accessorKey: "cancelAtPeriodEnd",
    header: "Cancela no fim",
    cell: ({ row }) =>
      row.original.cancelAtPeriodEnd ? (
        <Badge variant="secondary">Sim</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "gracePeriodEndsAt",
    header: "Carência",
    cell: ({ row }) =>
      row.original.gracePeriodEndsAt ? (
        formatDatePtBr(row.original.gracePeriodEndsAt)
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "stripeSubscriptionId",
    header: "Stripe",
    cell: ({ row }) => (
      <a
        href={stripeSubscriptionDashboardUrl(row.original.stripeSubscriptionId)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
      >
        Abrir
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </a>
    ),
  },
];

export type SubscriptionsTableProps = {
  initialData: PaginatedResponse<AdminSubscriptionListItem>;
};

export function SubscriptionsTable({ initialData }: SubscriptionsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);

  const loadPage = useCallback(
    (nextPage: number) => {
      const input: ListAdminSubscriptionsInput = {
        page: nextPage,
        pageSize: data.pageSize,
      };

      const params = new URLSearchParams();
      if (nextPage > 1) params.set("page", String(nextPage));

      startTransition(() => {
        router.push(
          params.toString() ? `/admin/billing?${params.toString()}` : "/admin/billing",
        );
        listAdminSubscriptions(input).then((result) => {
          if (result.data) {
            setData(result.data);
          }
        });
      });
    },
    [data.pageSize, router],
  );

  if (data.items.length === 0 && !isPending) {
    return (
      <AdminEmptyState
        title="Nenhuma assinatura encontrada"
        description="Ainda não há assinaturas registradas na plataforma."
      />
    );
  }

  return (
    <AdminDataTable
      columns={columns}
      data={data.items}
      page={data.page}
      pageSize={data.pageSize}
      totalCount={data.totalCount}
      onPageChange={loadPage}
      isLoading={isPending}
    />
  );
}

export type BillingDashboardProps = {
  initialMetrics: AdminBillingMetricsData;
  initialPeriodDays: number;
  subscriptions: SubscriptionsTableProps;
};

export function BillingDashboard({
  initialMetrics,
  initialPeriodDays,
  subscriptions,
}: BillingDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [periodDays, setPeriodDays] = useState(initialPeriodDays);
  const [metrics, setMetrics] = useState(initialMetrics);

  const onPeriodChange = (days: number) => {
    setPeriodDays(days);
    startTransition(() => {
      adminBillingMetrics({ periodDays: days }).then((result) => {
        if (result.data) {
          setMetrics(result.data);
        }
      });
    });
  };

  const activeSubscribers = PLAN_TIERS.reduce(
    (sum, tier) => sum + metrics.subscribersByTier[tier],
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">
          Métricas do período selecionado (novas assinaturas e cancelamentos)
        </p>
        <AdminDateRangeFilter value={periodDays} onChange={onPeriodChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="MRR estimado"
          value={formatCurrencyFromCents(metrics.mrrEstimatedCents)}
          description={`${activeSubscribers} assinante(s) ativo(s) ou em teste`}
          icon={CreditCardIcon}
        />
        <MetricCard
          title="Assinantes por plano"
          value={activeSubscribers}
          description={tierDistributionDescription(metrics.subscribersByTier)}
          icon={SparklesIcon}
        />
        <MetricCard
          title="Novas assinaturas"
          value={metrics.newSubscriptions}
          description={`Últimos ${periodDays} dias`}
          icon={TrendingUpIcon}
        />
        <MetricCard
          title="Cancelamentos"
          value={metrics.cancellations}
          description={`Últimos ${periodDays} dias`}
          icon={TrendingDownIcon}
        />
        <MetricCard
          title="Pagamento em atraso"
          value={metrics.pastDue}
          description="Status past_due"
          icon={AlertTriangleIcon}
          badge={
            metrics.pastDue > 0
              ? { text: "Atenção", variant: "destructive" }
              : undefined
          }
        />
        <MetricCard
          title="Cancelamento agendado"
          value={metrics.cancelAtPeriodEnd}
          description="cancelAtPeriodEnd = true"
          icon={UserMinusIcon}
        />
        <MetricCard
          title="Early adopters sem plano"
          value={metrics.earlyAdoptersWithoutPlan}
          description="Sem assinatura ativa ou em teste"
          icon={SparklesIcon}
        />
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Distribuição por status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {SUBSCRIPTION_STATUSES.map((status) => {
              const count = metrics.statusDistribution[status] ?? 0;
              if (count === 0) return null;
              return (
                <Badge key={status} variant="outline">
                  {STATUS_LABELS[status]}: {count}
                </Badge>
              );
            })}
            {Object.entries(metrics.statusDistribution)
              .filter(
                ([status]) =>
                  !SUBSCRIPTION_STATUSES.includes(
                    status as (typeof SUBSCRIPTION_STATUSES)[number],
                  ),
              )
              .map(([status, count]) => (
                <Badge key={status} variant="outline">
                  {status}: {count}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-base font-semibold">Assinaturas</h2>
        <div className={isPending ? "opacity-70 transition-opacity" : undefined}>
          <SubscriptionsTable {...subscriptions} />
        </div>
      </div>
    </div>
  );
}
