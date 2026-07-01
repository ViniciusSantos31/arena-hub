"use client";

import type { ComponentType } from "react";
import type { AdminGroupDetail } from "@/actions/admin/groups/detail";
import { GroupOwnerChip } from "../group-owner-chip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { getCategoryLabelById } from "@/utils/categories";
import { getRoleLabel } from "@/utils/role";
import { getSportIconById, getSportLabelById, Sport } from "@/utils/sports";
import { formatDate } from "@/utils/date";
import {
  CalendarIcon,
  ClockIcon,
  CrownIcon,
  GavelIcon,
  LinkIcon,
  LockIcon,
  MapPinIcon,
  MessageSquareIcon,
  ShieldIcon,
  TrophyIcon,
  UnlockIcon,
  UserPlusIcon,
  UsersRoundIcon,
} from "lucide-react";

function formatDateTimePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDatePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function roleLabel(role: AdminGroupDetail["members"][number]["role"]) {
  switch (role) {
    case "owner":
      return "Dono";
    case "admin":
      return "Admin";
    case "guest":
      return "Convidado";
    default:
      return "Membro";
  }
}

function statusLabel(status: AdminGroupDetail["matches"][number]["status"]) {
  switch (status) {
    case "scheduled":
      return "Agendada";
    case "open_registration":
      return "Inscrições abertas";
    case "closed_registration":
      return "Inscrições fechadas";
    case "team_sorted":
      return "Times sorteados";
    case "completed":
      return "Concluída";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

function statusVariant(status: AdminGroupDetail["matches"][number]["status"]) {
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

const inviteLinkStatusLabels: Record<
  AdminGroupDetail["inviteLinks"][number]["status"],
  string
> = {
  revoked: "Revogado",
  expired: "Expirado",
  "max-uses-reached": "Limite atingido",
  active: "Ativo",
};

function formatUses(usesCount: number, maxUses: number | null) {
  if (!maxUses) return `${usesCount} uso(s)`;
  return `${usesCount}/${maxUses} uso(s)`;
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="border-border/60 bg-background/50 rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center gap-1 text-xs">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

export function GroupAdminDetailView({ data }: { data: AdminGroupDetail }) {
  const occupancyText = `${data.group.memberCount}/${data.group.maxPlayers}`;
  const occupancyPercent = data.group.occupancyRate;

  const renderSportIcon = (sport: Sport) => {
    const SportIcon = getSportIconById(sport);
    return (
      <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
        <SportIcon className="text-primary h-5 w-5" />
      </div>
    );
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Visão geral</TabsTrigger>
        <TabsTrigger value="members">Membros</TabsTrigger>
        <TabsTrigger value="matches">Partidas</TabsTrigger>
        <TabsTrigger value="invites">
          Convites ({data.inviteLinks.length})
        </TabsTrigger>
        {data.group.private ? (
          <TabsTrigger value="requests">
            Pedidos ({data.joinRequests.length})
          </TabsTrigger>
        ) : null}
      </TabsList>

      <TabsContent value="overview">
        <Card className="border-border/60 overflow-hidden">
          <CardHeader className="gap-4">
            <div className="flex items-start gap-3">
              <Avatar className="size-14 rounded-2xl">
                <AvatarImage
                  src={data.group.logo ?? undefined}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary/10 text-primary rounded-2xl text-base font-semibold">
                  {getAvatarFallback(data.group.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{data.group.name}</CardTitle>
                  <Badge variant="outline">{data.group.code}</Badge>
                  {data.group.private ? (
                    <Badge variant="secondary" className="gap-1">
                      <LockIcon className="h-3.5 w-3.5" />
                      Privado
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <UnlockIcon className="h-3.5 w-3.5" />
                      Público
                    </Badge>
                  )}
                </div>

                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    Criado em {formatDatePtBr(data.group.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    Última atividade{" "}
                    {formatDateTimePtBr(data.group.lastActivityAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-2 pt-0">
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="border-border/60 bg-background/50 rounded-lg border p-4 sm:col-span-1">
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <UsersRoundIcon className="h-3.5 w-3.5" />
                  Lotação
                </div>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <div className="text-lg font-semibold">{occupancyText}</div>
                  <div className="text-muted-foreground text-xs">
                    {occupancyPercent}%
                  </div>
                </div>
                <div className="bg-muted mt-2 h-1.5 w-full rounded-full">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-[width]"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              <MetricCard
                icon={TrophyIcon}
                label="Partidas (30d)"
                value={String(data.group.matchesLast30d)}
              />
              <MetricCard
                icon={TrophyIcon}
                label="Conclusão"
                value={`${data.group.matchCompletionRate}%`}
              />
              <MetricCard
                icon={UserPlusIcon}
                label="Pedidos pendentes"
                value={String(data.group.pendingJoinRequests)}
              />
              <MetricCard
                icon={LinkIcon}
                label="Links ativos"
                value={String(data.group.activeInviteLinks)}
              />
              <MetricCard
                icon={GavelIcon}
                label="Punições (30d)"
                value={String(data.group.recentPunishments)}
              />
            </div>

            <div className="border-border/60 bg-background/50 rounded-lg border p-4">
              <div className="text-muted-foreground mb-2 text-xs">
                Dono do grupo
              </div>
              <GroupOwnerChip owner={data.group.owner} />
            </div>

            {data.group.rules ? (
              <div className="border-border/60 bg-background/50 rounded-lg border p-4">
                <div className="text-muted-foreground mb-1 text-xs">Regras</div>
                <div className="text-sm whitespace-pre-wrap">
                  {data.group.rules}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="members">
        <Card className="border-border/60 py-0">
          <CardHeader className="pt-6">
            <CardTitle className="text-base">
              Membros ({data.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {data.members.length === 0 ? (
              <div className="text-muted-foreground px-6 pb-6 text-sm">
                Nenhum membro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="border-t">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead>Entrou em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={m.user.image ?? undefined} />
                              <AvatarFallback className="text-xs">
                                {getAvatarFallback(m.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {m.user.name}
                              </div>
                              <div className="text-muted-foreground truncate text-xs">
                                {m.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "gap-1",
                              m.role === "owner" &&
                                "bg-primary/10 text-primary",
                            )}
                          >
                            {m.role === "owner" ? (
                              <CrownIcon className="h-3.5 w-3.5" />
                            ) : m.role === "admin" ? (
                              <ShieldIcon className="h-3.5 w-3.5" />
                            ) : null}
                            {roleLabel(m.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {m.score}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDateTimePtBr(m.joinedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="matches">
        <Card className="border-border/60 py-0">
          <CardHeader className="pt-6">
            <CardTitle className="text-base">
              Partidas ({data.matches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {data.matches.length === 0 ? (
              <div className="text-muted-foreground px-6 pb-6 text-sm">
                Nenhuma partida.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partida</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quando</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead className="text-right">Jogadores</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.matches.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="min-w-[240px]">
                          <div className="flex items-start gap-2">
                            {renderSportIcon(m.sport as Sport)}
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {m.title}
                              </div>
                              <div className="text-muted-foreground truncate text-xs">
                                {getSportLabelById(m.sport)} ·{" "}
                                {getCategoryLabelById(m.category)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant(m.status)}>
                            {statusLabel(m.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <CalendarIcon className="h-3.5 w-3.5" />
                            {formatDatePtBr(m.date)}
                          </div>
                          <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                            <ClockIcon className="h-3.5 w-3.5" />
                            {m.time}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="text-muted-foreground flex items-center gap-1 text-xs">
                            <MapPinIcon className="h-3.5 w-3.5" />
                            <span className="truncate">{m.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium">
                          {m.minPlayers}-{m.maxPlayers}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invites">
        <Card className="border-border/60 py-0">
          <CardHeader className="pt-6">
            <CardTitle className="text-base">
              Links de convite ({data.inviteLinks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            {data.inviteLinks.length === 0 ? (
              <div className="text-muted-foreground px-6 pb-6 text-sm">
                Nenhum link de convite.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="border-t">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Função padrão</TableHead>
                      <TableHead>Usos</TableHead>
                      <TableHead>Expiração</TableHead>
                      <TableHead>Criado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.inviteLinks.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {link.label || "Link sem nome"}
                          </div>
                          {link.revokedReason ? (
                            <div className="text-muted-foreground mt-0.5 text-xs">
                              Motivo: {link.revokedReason}
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              link.status === "active" ? "secondary" : "outline"
                            }
                          >
                            {inviteLinkStatusLabels[link.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getRoleLabel(link.defaultRole)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatUses(link.usesCount, link.maxUses)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {link.expiresAt
                            ? formatDate(link.expiresAt)
                            : "Não expira"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDatePtBr(link.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {data.group.private ? (
        <TabsContent value="requests">
          <Card className="border-border/60 py-0">
            <CardHeader className="pt-6">
              <CardTitle className="text-base">
                Pedidos de entrada ({data.joinRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-0">
              {data.joinRequests.length === 0 ? (
                <div className="text-muted-foreground px-6 pb-6 text-sm">
                  Nenhum pedido pendente.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="border-t">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solicitante</TableHead>
                        <TableHead>Mensagem</TableHead>
                        <TableHead>Solicitado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.joinRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="flex min-w-0 items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={req.user.image ?? undefined}
                                />
                                <AvatarFallback className="text-xs">
                                  {getAvatarFallback(req.user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium">
                                  {req.user.name}
                                </div>
                                <div className="text-muted-foreground truncate text-xs">
                                  {req.user.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {req.message ? (
                              <div className="text-muted-foreground flex items-start gap-1 text-sm">
                                <MessageSquareIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span className="line-clamp-2">{req.message}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDateTimePtBr(req.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
