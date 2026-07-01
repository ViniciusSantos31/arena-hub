"use client";

import type {
  AdminMatchListItem,
  AdminMatchMetrics,
  ListAdminMatchesInput,
  ListAdminMatchesResponse,
} from "@/actions/admin/matches/list";
import { listAdminMatches } from "@/actions/admin/matches/list";
import { AdminDataTable } from "@/app/admin/_components/admin-data-table";
import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PaginatedResponse } from "@/lib/admin/types";
import { getCategoryLabelById } from "@/utils/categories";
import {
  getSportLabelById,
  sportOptions,
} from "@/utils/sports";
import { getStatusLabel, type Status } from "@/utils/status";
import { ColumnDef } from "@tanstack/react-table";
import {
  BanIcon,
  ClockIcon,
  PercentIcon,
  SearchIcon,
  SwordsIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

const MATCH_STATUSES: Status[] = [
  "scheduled",
  "open_registration",
  "closed_registration",
  "team_sorted",
  "completed",
  "cancelled",
];

function formatDatePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function statusVariant(status: Status) {
  switch (status) {
    case "completed":
      return "default" as const;
    case "cancelled":
      return "destructive" as const;
    case "open_registration":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
}

function parseFilters(searchParams: URLSearchParams): ListAdminMatchesInput {
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  const organizationId = searchParams.get("organizationId") || undefined;
  const status = searchParams.get("status") as Status | null;
  const sport = searchParams.get("sport") || undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const search = searchParams.get("search") || undefined;

  return {
    page,
    pageSize,
    organizationId,
    status:
      status && MATCH_STATUSES.includes(status) ? status : undefined,
    sport:
      sport && sportOptions.some((option) => option.id === sport)
        ? sport
        : undefined,
    dateFrom,
    dateTo,
    search: search || undefined,
  };
}

function buildSearchParams(
  filters: ListAdminMatchesInput,
  overrides?: Partial<ListAdminMatchesInput>,
): URLSearchParams {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.page && merged.page > 1) {
    params.set("page", String(merged.page));
  }
  if (merged.pageSize && merged.pageSize !== 20) {
    params.set("pageSize", String(merged.pageSize));
  }
  if (merged.organizationId) {
    params.set("organizationId", merged.organizationId);
  }
  if (merged.status) params.set("status", merged.status);
  if (merged.sport) params.set("sport", merged.sport);
  if (merged.dateFrom) params.set("dateFrom", merged.dateFrom);
  if (merged.dateTo) params.set("dateTo", merged.dateTo);
  if (merged.search) params.set("search", merged.search);

  return params;
}

const columns: ColumnDef<AdminMatchListItem>[] = [
  {
    accessorKey: "title",
    header: "Partida",
    cell: ({ row }) => {
      const match = row.original;
      return (
        <Link
          href={`/admin/matches/${match.id}`}
          className="font-medium hover:underline"
        >
          {match.title}
        </Link>
      );
    },
  },
  {
    accessorKey: "organizationName",
    header: "Grupo",
    cell: ({ row }) => {
      const match = row.original;
      if (!match.organizationCode || !match.organizationName) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <Link
          href={`/admin/groups/${match.organizationCode}`}
          className="text-sm hover:underline"
        >
          {match.organizationName}
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusVariant(row.original.status)}>
        {getStatusLabel(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "sport",
    header: "Esporte",
    cell: ({ row }) => getSportLabelById(row.original.sport),
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => getCategoryLabelById(row.original.category),
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDatePtBr(row.original.date)} · {row.original.time}
      </span>
    ),
  },
  {
    id: "players",
    header: "Jogadores",
    cell: ({ row }) =>
      `${row.original.confirmedPlayers}/${row.original.maxPlayers}`,
  },
  {
    accessorKey: "createdAt",
    header: "Criada em",
    cell: ({ row }) => formatDatePtBr(row.original.createdAt),
  },
];

export type OrganizationFilterOption = {
  id: string;
  name: string;
  code: string;
};

export type MatchesTableProps = {
  initialData: ListAdminMatchesResponse;
  initialFilters: ListAdminMatchesInput;
  organizations: OrganizationFilterOption[];
};

function MetricsSection({ metrics }: { metrics: AdminMatchMetrics }) {
  const activeMatches =
    metrics.byStatus.scheduled +
    metrics.byStatus.open_registration +
    metrics.byStatus.closed_registration +
    metrics.byStatus.team_sorted;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Partidas ativas"
          value={activeMatches}
          description="Fora de concluídas/canceladas"
          icon={SwordsIcon}
        />
        <MetricCard
          title="Taxa de preenchimento"
          value={`${metrics.fillRate}%`}
          description="Média confirmados / vagas"
          icon={PercentIcon}
        />
        <MetricCard
          title="Taxa de cancelamento"
          value={`${metrics.cancellationRate}%`}
          description="Canceladas no recorte"
          icon={BanIcon}
        />
        <MetricCard
          title="Tempo médio conclusão"
          value={
            metrics.avgCompletionTimeHours === null
              ? "—"
              : `${metrics.avgCompletionTimeHours}h`
          }
          description="Criação até conclusão"
          icon={ClockIcon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Por status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {MATCH_STATUSES.map((status) => (
              <Badge key={status} variant={statusVariant(status)}>
                {getStatusLabel(status)}: {metrics.byStatus[status]}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Esporte / categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.bySportCategory.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem dados</p>
            ) : (
              metrics.bySportCategory.map((item) => (
                <div
                  key={`${item.sport}-${item.category}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {getSportLabelById(item.sport)} ·{" "}
                    {getCategoryLabelById(item.category)}
                  </span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top grupos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.topGroups.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem dados</p>
            ) : (
              metrics.topGroups.map((group) => (
                <div
                  key={group.organizationId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <Link
                    href={`/admin/groups/${group.organizationCode}`}
                    className="truncate hover:underline"
                  >
                    {group.organizationName}
                  </Link>
                  <Badge variant="secondary">{group.matchCount}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function MatchesTable({
  initialData,
  initialFilters,
  organizations,
}: MatchesTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search ?? "");

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.organizationId ||
        filters.status ||
        filters.sport ||
        filters.dateFrom ||
        filters.dateTo,
    );
  }, [filters]);

  const applyFilters = useCallback(
    (next: Partial<ListAdminMatchesInput>) => {
      const merged: ListAdminMatchesInput = {
        ...filters,
        ...next,
        page: next.page ?? 1,
      };
      setFilters(merged);

      const params = buildSearchParams(merged);
      const query = params.toString();

      startTransition(() => {
        router.push(query ? `/admin/matches?${query}` : "/admin/matches");
        listAdminMatches(merged).then((result) => {
          if (result.data) {
            setData(result.data);
          }
        });
      });
    },
    [filters, router],
  );

  const clearFilters = () => {
    setSearchInput("");
    setFilters({ page: 1, pageSize: filters.pageSize });
    startTransition(() => {
      router.push("/admin/matches");
      listAdminMatches({ page: 1, pageSize: filters.pageSize }).then(
        (result) => {
          if (result.data) {
            setData(result.data);
          }
        },
      );
    });
  };

  const list: PaginatedResponse<AdminMatchListItem> = data.list;

  return (
    <div className="space-y-6">
      <MetricsSection metrics={data.metrics} />

      <div className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Buscar por título..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters({ search: searchInput || undefined });
                  }
                }}
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => applyFilters({ search: searchInput || undefined })}
              disabled={isPending}
            >
              Buscar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.organizationId ?? "all"}
              onValueChange={(value) =>
                applyFilters({
                  organizationId: value === "all" ? undefined : value,
                })
              }
              placeholder="Grupo"
              className="w-[200px]"
              options={[
                { value: "all", label: "Todos os grupos" },
                ...organizations.map((org) => ({
                  value: org.id,
                  label: org.name,
                })),
              ]}
            />

            <Select
              value={filters.status ?? "all"}
              onValueChange={(value) =>
                applyFilters({
                  status:
                    value === "all" ? undefined : (value as Status),
                })
              }
              placeholder="Status"
              className="w-[180px]"
              options={[
                { value: "all", label: "Todos os status" },
                ...MATCH_STATUSES.map((status) => ({
                  value: status,
                  label: getStatusLabel(status),
                })),
              ]}
            />

            <Select
              value={filters.sport ?? "all"}
              onValueChange={(value) =>
                applyFilters({
                  sport: value === "all" ? undefined : value,
                })
              }
              placeholder="Esporte"
              className="w-[160px]"
              options={[
                { value: "all", label: "Todos os esportes" },
                ...sportOptions.map((sport) => ({
                  value: sport.id,
                  label: sport.name,
                })),
              ]}
            />

            <Input
              type="date"
              value={filters.dateFrom?.slice(0, 10) ?? ""}
              onChange={(e) =>
                applyFilters({
                  dateFrom: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
              className="w-[160px]"
              aria-label="Data a partir de"
            />

            <Input
              type="date"
              value={filters.dateTo?.slice(0, 10) ?? ""}
              onChange={(e) =>
                applyFilters({
                  dateTo: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
              className="w-[160px]"
              aria-label="Data até"
            />

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={isPending}
              >
                <XIcon className="mr-1 h-4 w-4" />
                Limpar
              </Button>
            ) : null}
          </div>
        </div>

        {list.items.length === 0 && !isPending ? (
          <AdminEmptyState
            title="Nenhuma partida encontrada"
            description={
              hasActiveFilters
                ? "Tente ajustar os filtros para ver mais resultados."
                : "Ainda não há partidas cadastradas na plataforma."
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          <AdminDataTable
            columns={columns}
            data={list.items}
            page={list.page}
            pageSize={list.pageSize}
            totalCount={list.totalCount}
            onPageChange={(page) => applyFilters({ page })}
            isLoading={isPending}
          />
        )}
      </div>
    </div>
  );
}

export { parseFilters };
