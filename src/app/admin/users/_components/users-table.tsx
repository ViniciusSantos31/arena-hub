"use client";

import type {
  AdminUserListItem,
  ListAdminUsersInput,
} from "@/actions/admin/users/list";
import { listAdminUsers } from "@/actions/admin/users/list";
import { AdminDataTable } from "@/app/admin/_components/admin-data-table";
import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { PaginatedResponse } from "@/lib/admin/types";
import { PLAN_TIER_LABELS, PLAN_TIERS } from "@/lib/user-plan/plan-tiers";
import { getAvatarFallback } from "@/utils/avatar";
import { ColumnDef } from "@tanstack/react-table";
import { SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

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

const TUTORIAL_LABELS: Record<AdminUserListItem["tutorialProgress"], string> = {
  not_started: "Não iniciado",
  in_progress: "Em andamento",
  completed: "Concluído",
};

function formatDatePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function parseFilters(searchParams: URLSearchParams): ListAdminUsersInput {
  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("pageSize")) || 20;
  const search = searchParams.get("search") || undefined;
  const planTier = searchParams.get("planTier") as
    | ListAdminUsersInput["planTier"]
    | null;
  const subscriptionStatus = searchParams.get("subscriptionStatus") as
    | ListAdminUsersInput["subscriptionStatus"]
    | null;
  const isEarlyAdopterRaw = searchParams.get("isEarlyAdopter");
  const emailVerifiedRaw = searchParams.get("emailVerified");
  const createdFrom = searchParams.get("createdFrom") || undefined;
  const createdTo = searchParams.get("createdTo") || undefined;

  return {
    page,
    pageSize,
    search: search || undefined,
    planTier: planTier && PLAN_TIERS.includes(planTier) ? planTier : undefined,
    subscriptionStatus:
      subscriptionStatus &&
      SUBSCRIPTION_STATUSES.includes(
        subscriptionStatus as (typeof SUBSCRIPTION_STATUSES)[number],
      )
        ? subscriptionStatus
        : undefined,
    isEarlyAdopter:
      isEarlyAdopterRaw === "true"
        ? true
        : isEarlyAdopterRaw === "false"
          ? false
          : undefined,
    emailVerified:
      emailVerifiedRaw === "true"
        ? true
        : emailVerifiedRaw === "false"
          ? false
          : undefined,
    createdFrom,
    createdTo,
  };
}

function buildSearchParams(
  filters: ListAdminUsersInput,
  overrides?: Partial<ListAdminUsersInput>,
): URLSearchParams {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();

  if (merged.page && merged.page > 1) {
    params.set("page", String(merged.page));
  }
  if (merged.pageSize && merged.pageSize !== 20) {
    params.set("pageSize", String(merged.pageSize));
  }
  if (merged.search) params.set("search", merged.search);
  if (merged.planTier) params.set("planTier", merged.planTier);
  if (merged.subscriptionStatus) {
    params.set("subscriptionStatus", merged.subscriptionStatus);
  }
  if (merged.isEarlyAdopter !== undefined) {
    params.set("isEarlyAdopter", String(merged.isEarlyAdopter));
  }
  if (merged.emailVerified !== undefined) {
    params.set("emailVerified", String(merged.emailVerified));
  }
  if (merged.createdFrom) params.set("createdFrom", merged.createdFrom);
  if (merged.createdTo) params.set("createdTo", merged.createdTo);

  return params;
}

const columns: ColumnDef<AdminUserListItem>[] = [
  {
    accessorKey: "name",
    header: "Usuário",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <Link
          href={`/admin/users/${user.id}`}
          className="flex items-center gap-3 hover:underline"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback>{getAvatarFallback(user.name)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
        </Link>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "emailVerified",
    header: "Verificado",
    cell: ({ row }) => (
      <Badge variant={row.original.emailVerified ? "default" : "secondary"}>
        {row.original.emailVerified ? "Sim" : "Não"}
      </Badge>
    ),
  },
  {
    accessorKey: "isEarlyAdopter",
    header: "Early adopter",
    cell: ({ row }) =>
      row.original.isEarlyAdopter ? (
        <Badge variant="outline">Sim</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "planTier",
    header: "Plano",
    cell: ({ row }) =>
      row.original.planTier ? (
        PLAN_TIER_LABELS[row.original.planTier]
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "subscriptionStatus",
    header: "Assinatura",
    cell: ({ row }) => {
      const status = row.original.subscriptionStatus;
      if (!status) {
        return <span className="text-muted-foreground text-sm">—</span>;
      }
      return (
        <Badge variant="outline">
          {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "ownedGroupsCount",
    header: "Grupos (owner)",
    cell: ({ row }) => row.original.ownedGroupsCount,
  },
  {
    accessorKey: "matchesPlayed",
    header: "Partidas",
    cell: ({ row }) => row.original.matchesPlayed,
  },
  {
    accessorKey: "tutorialProgress",
    header: "Tutorial",
    cell: ({ row }) => TUTORIAL_LABELS[row.original.tutorialProgress],
  },
  {
    accessorKey: "lookingForGroup",
    header: "LFG",
    cell: ({ row }) =>
      row.original.lookingForGroup ? (
        <Badge variant="outline">Ativo</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    accessorKey: "createdAt",
    header: "Cadastro",
    cell: ({ row }) => formatDatePtBr(row.original.createdAt),
  },
];

export type UsersTableProps = {
  initialData: PaginatedResponse<AdminUserListItem>;
  initialFilters: ListAdminUsersInput;
};

export function UsersTable({ initialData, initialFilters }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search ?? "");

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
      filters.planTier ||
      filters.subscriptionStatus ||
      filters.isEarlyAdopter !== undefined ||
      filters.emailVerified !== undefined ||
      filters.createdFrom ||
      filters.createdTo,
    );
  }, [filters]);

  const applyFilters = useCallback(
    (next: Partial<ListAdminUsersInput>) => {
      const merged: ListAdminUsersInput = {
        ...filters,
        ...next,
        page: next.page ?? 1,
      };
      setFilters(merged);

      const params = buildSearchParams(merged);
      const query = params.toString();

      startTransition(() => {
        router.push(query ? `/admin/users?${query}` : "/admin/users");
        listAdminUsers(merged).then((result) => {
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
      router.push("/admin/users");
      listAdminUsers({ page: 1, pageSize: filters.pageSize }).then((result) => {
        if (result.data) {
          setData(result.data);
        }
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nome ou email..."
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
            value={filters.planTier ?? "all"}
            onValueChange={(value) =>
              applyFilters({
                planTier:
                  value === "all"
                    ? undefined
                    : (value as ListAdminUsersInput["planTier"]),
              })
            }
            placeholder="Plano"
            className="w-[160px]"
            options={[
              { value: "all", label: "Todos os planos" },
              ...PLAN_TIERS.map((tier) => ({
                value: tier,
                label: PLAN_TIER_LABELS[tier],
              })),
            ]}
          />

          <Select
            value={filters.subscriptionStatus ?? "all"}
            onValueChange={(value) =>
              applyFilters({
                subscriptionStatus:
                  value === "all"
                    ? undefined
                    : (value as ListAdminUsersInput["subscriptionStatus"]),
              })
            }
            placeholder="Assinatura"
            className="w-[180px]"
            options={[
              { value: "all", label: "Todos os status" },
              ...SUBSCRIPTION_STATUSES.map((status) => ({
                value: status,
                label: STATUS_LABELS[status],
              })),
            ]}
          />

          <Select
            value={
              filters.isEarlyAdopter === undefined
                ? "all"
                : String(filters.isEarlyAdopter)
            }
            onValueChange={(value) =>
              applyFilters({
                isEarlyAdopter: value === "all" ? undefined : value === "true",
              })
            }
            placeholder="Early adopter"
            className="w-[160px]"
            options={[
              { value: "all", label: "Early adopter" },
              { value: "true", label: "Sim" },
              { value: "false", label: "Não" },
            ]}
          />

          <Select
            value={
              filters.emailVerified === undefined
                ? "all"
                : String(filters.emailVerified)
            }
            onValueChange={(value) =>
              applyFilters({
                emailVerified: value === "all" ? undefined : value === "true",
              })
            }
            placeholder="Verificado"
            className="w-[160px]"
            options={[
              { value: "all", label: "Email verificado" },
              { value: "true", label: "Sim" },
              { value: "false", label: "Não" },
            ]}
          />

          <Input
            type="date"
            value={filters.createdFrom?.slice(0, 10) ?? ""}
            onChange={(e) =>
              applyFilters({
                createdFrom: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
            className="w-[160px]"
            aria-label="Cadastro a partir de"
          />

          <Input
            type="date"
            value={filters.createdTo?.slice(0, 10) ?? ""}
            onChange={(e) =>
              applyFilters({
                createdTo: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
            className="w-[160px]"
            aria-label="Cadastro até"
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

      {data.items.length === 0 && !isPending ? (
        <AdminEmptyState
          title="Nenhum usuário encontrado"
          description={
            hasActiveFilters
              ? "Tente ajustar os filtros para ver mais resultados."
              : "Ainda não há usuários cadastrados na plataforma."
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
          data={data.items}
          page={data.page}
          pageSize={data.pageSize}
          totalCount={data.totalCount}
          onPageChange={(page) => applyFilters({ page })}
          isLoading={isPending}
        />
      )}
    </div>
  );
}

export { parseFilters };
