"use client";

import type { AdminMatchDetail } from "@/actions/admin/matches/detail";
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
import { getAvatarFallback } from "@/utils/avatar";
import { getCategoryLabelById } from "@/utils/categories";
import { getSportIconById, getSportLabelById, type Sport } from "@/utils/sports";
import { getStatusLabel } from "@/utils/status";
import {
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";

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

function statusVariant(status: AdminMatchDetail["match"]["status"]) {
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

function paymentStatusLabel(
  status: AdminMatchDetail["confirmedPlayers"][number]["paymentStatus"],
) {
  switch (status) {
    case "paid":
      return "Pago";
    case "exempt":
      return "Isento";
    case "refunded":
      return "Reembolsado";
    default:
      return "Pendente";
  }
}

function PlayersTable({
  title,
  players,
  emptyMessage,
}: {
  title: string;
  players: AdminMatchDetail["confirmedPlayers"];
  emptyMessage: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jogador</TableHead>
                <TableHead>Confirmado</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Entrada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={player.image ?? undefined}
                          alt={player.name ?? "Jogador"}
                        />
                        <AvatarFallback>
                          {getAvatarFallback(player.name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        {player.userId ? (
                          <Link
                            href={`/admin/users/${player.userId}`}
                            className="font-medium hover:underline"
                          >
                            {player.name ?? "Sem nome"}
                          </Link>
                        ) : (
                          <span className="font-medium">
                            {player.name ?? "Sem nome"}
                          </span>
                        )}
                        {player.email ? (
                          <p className="text-muted-foreground truncate text-xs">
                            {player.email}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={player.confirmed ? "default" : "secondary"}>
                      {player.confirmed ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  <TableCell>{paymentStatusLabel(player.paymentStatus)}</TableCell>
                  <TableCell>
                    {player.teamId !== null ? player.teamId : "—"}
                  </TableCell>
                  <TableCell>{formatDatePtBr(player.joinedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export function MatchAdminDetailView({ data }: { data: AdminMatchDetail }) {
  const { match, organization } = data;
  const SportIcon = getSportIconById(match.sport as Sport);
  const priceLabel =
    match.isPaid && match.price != null
      ? new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(match.price / 100)
      : "Grátis";

  return (
    <div className="space-y-6">
      <Card className="border-border/60 overflow-hidden">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <SportIcon className="text-primary h-6 w-6" />
              </div>
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{match.title}</h2>
                  <Badge variant={statusVariant(match.status)}>
                    {getStatusLabel(match.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  {getSportLabelById(match.sport)} ·{" "}
                  {getCategoryLabelById(match.category)}
                </p>
              </div>
            </div>
            {organization ? (
              <Link
                href={`/admin/groups/${organization.code}`}
                className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
              >
                <UsersRoundIcon className="h-4 w-4" />
                {organization.name}
                <ExternalLinkIcon className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-start gap-2 text-sm">
            <CalendarIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Data</p>
              <p className="text-muted-foreground">
                {formatDatePtBr(match.date)} · {match.time}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPinIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Local</p>
              <p className="text-muted-foreground">{match.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <UsersRoundIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Vagas</p>
              <p className="text-muted-foreground">
                {match.minPlayers}–{match.maxPlayers} jogadores · {priceLabel}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <ClockIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Registro</p>
              <p className="text-muted-foreground">
                Criada {formatDateTimePtBr(match.createdAt)}
              </p>
              {match.scheduledTo ? (
                <p className="text-muted-foreground">
                  Agendada para {formatDateTimePtBr(match.scheduledTo)}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
        {match.description ? (
          <CardContent className="border-t pt-4">
            <p className="text-muted-foreground text-sm whitespace-pre-wrap">
              {match.description}
            </p>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayersTable
          title={`Confirmados (${data.confirmedPlayers.length})`}
          players={data.confirmedPlayers}
          emptyMessage="Nenhum jogador confirmado na lista principal."
        />
        <PlayersTable
          title={`Fila de espera (${data.waitingQueue.length})`}
          players={data.waitingQueue}
          emptyMessage="Nenhum jogador na fila de espera."
        />
      </div>
    </div>
  );
}
