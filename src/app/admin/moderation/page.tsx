import {
  adminModerationMetrics,
  listAdminCrossGroupPunishments,
} from "@/actions/admin/moderation/metrics";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangleIcon,
  BanIcon,
  MessageSquareIcon,
  ShieldIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { ModerationDashboardClient } from "./_components/moderation-dashboard-client";

export const dynamic = "force-dynamic";

const VALID_DAYS = [7, 30, 90] as const;

function parseDays(value: string | undefined): (typeof VALID_DAYS)[number] {
  const parsed = Number(value);
  if (VALID_DAYS.includes(parsed as (typeof VALID_DAYS)[number])) {
    return parsed as (typeof VALID_DAYS)[number];
  }
  return 30;
}

function formatDatePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; page?: string }>;
}) {
  const params = await searchParams;
  const days = parseDays(params.days);
  const page = Number(params.page) || 1;

  const [metricsResult, punishmentsResult] = await Promise.all([
    adminModerationMetrics({ days }),
    listAdminCrossGroupPunishments({ page, pageSize: 50 }),
  ]);

  if (
    (metricsResult.serverError && !metricsResult.data) ||
    (punishmentsResult.serverError && !punishmentsResult.data)
  ) {
    return (
      <PageContainer>
        <PageContent>
          <div className="flex-1 items-center justify-center space-y-6 p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Erro ao carregar moderação
            </h2>
            <p className="text-muted-foreground">
              Não foi possível buscar as métricas ou punições. Tente novamente.
            </p>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  const metrics = metricsResult.data;
  const punishments = punishmentsResult.data ?? {
    items: [],
    page: 1,
    pageSize: 50,
    totalCount: 0,
    totalPages: 1,
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Moderação"
          description="Qualidade da comunidade, feedbacks e punições"
        />
      </PageHeader>
      <PageContent>
        <ModerationDashboardClient days={days}>
          <div className="flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/feedbacks">
                <MessageSquareIcon className="mr-2 h-4 w-4" />
                Ver feedbacks
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <MetricCard
              title="Rating médio"
              value={metrics?.avgFeedbackRating ?? 0}
              description="Média de todos os feedbacks"
              icon={StarIcon}
            />
            <MetricCard
              title="Feedbacks pendentes"
              value={metrics?.pendingFeedbacks ?? 0}
              description="Aguardando moderação"
              icon={MessageSquareIcon}
              badge={
                (metrics?.pendingFeedbacks ?? 0) > 0
                  ? { text: "Atenção", variant: "destructive" as const }
                  : undefined
              }
            />
            <MetricCard
              title="Punições no período"
              value={metrics?.punishmentsInPeriod ?? 0}
              description="Aplicadas no intervalo selecionado"
              icon={ShieldIcon}
            />
            <MetricCard
              title="Membros suspensos"
              value={metrics?.suspendedMembers ?? 0}
              description="Com suspensão ativa"
              icon={BanIcon}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangleIcon className="h-4 w-4" />
                Grupos com alta taxa de cancelamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(metrics?.highCancellationGroups.length ?? 0) === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum grupo com taxa elevada (mín. 3 partidas finalizadas ou
                  canceladas).
                </p>
              ) : (
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader className="bg-muted">
                      <TableRow>
                        <TableHead>Grupo</TableHead>
                        <TableHead>Concluídas</TableHead>
                        <TableHead>Canceladas</TableHead>
                        <TableHead>Taxa cancelamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics?.highCancellationGroups.map((group) => (
                        <TableRow key={group.organizationId}>
                          <TableCell>
                            <Link
                              href={`/admin/groups/${group.organizationCode}`}
                              className="font-medium hover:underline"
                            >
                              {group.organizationName}
                            </Link>
                            <p className="text-muted-foreground text-xs">
                              {group.organizationCode}
                            </p>
                          </TableCell>
                          <TableCell>{group.completedMatches}</TableCell>
                          <TableCell>{group.cancelledMatches}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {group.cancellationRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Punições cross-grupo (read-only)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Membro</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Aplicada por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {punishments.items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-muted-foreground h-24 text-center"
                        >
                          Nenhuma punição registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      punishments.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {formatDatePtBr(item.createdAt)}
                          </TableCell>
                          <TableCell>
                            {item.organizationCode ? (
                              <Link
                                href={`/admin/groups/${item.organizationCode}`}
                                className="hover:underline"
                              >
                                {item.organizationName ?? item.organizationCode}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {item.memberUserId ? (
                              <Link
                                href={`/admin/users/${item.memberUserId}`}
                                className="hover:underline"
                              >
                                {item.memberUserName ?? item.memberUserId}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {item.reason ?? "—"}
                          </TableCell>
                          <TableCell>
                            {item.appliedByUserName ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {punishments.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">
                    Página {punishments.page} de {punishments.totalPages} ·{" "}
                    {punishments.totalCount} registro(s)
                  </p>
                  <div className="flex gap-2">
                    {punishments.page > 1 && (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/moderation?days=${days}&page=${punishments.page - 1}`}
                        >
                          Anterior
                        </Link>
                      </Button>
                    )}
                    {punishments.page < punishments.totalPages && (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/admin/moderation?days=${days}&page=${punishments.page + 1}`}
                        >
                          Próxima
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </ModerationDashboardClient>
      </PageContent>
    </PageContainer>
  );
}
