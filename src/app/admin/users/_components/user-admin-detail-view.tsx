"use client";

import type { AdminUserDetail } from "@/actions/admin/users/detail";
import { AdminUserActions } from "@/app/admin/users/_components/admin-user-actions";
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
import {
  stripeCustomerDashboardUrl,
  stripeSubscriptionDashboardUrl,
} from "@/lib/admin/stripe-links";
import { PLAN_TIER_LABELS } from "@/lib/user-plan/plan-tiers";
import { getAvatarFallback } from "@/utils/avatar";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  MapPinIcon,
  SparklesIcon,
  StarIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";

const TUTORIAL_LABELS: Record<AdminUserDetail["tutorial"]["progress"], string> =
  {
    not_started: "Não iniciado",
    in_progress: "Em andamento",
    completed: "Concluído",
  };

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

function roleLabel(role: string) {
  switch (role) {
    case "admin":
      return "Admin";
    case "guest":
      return "Convidado";
    default:
      return "Membro";
  }
}

export function UserAdminDetailView({ data }: { data: AdminUserDetail }) {
  const { profile, subscription } = data;

  return (
    <div className="space-y-6">
      <AdminUserActions
        profile={profile}
        hasSubscription={subscription !== null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={profile.image ?? undefined} alt={profile.name} />
                <AvatarFallback>{getAvatarFallback(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold">{profile.name}</p>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={profile.emailVerified ? "default" : "secondary"}>
                    {profile.emailVerified ? "Email verificado" : "Email pendente"}
                  </Badge>
                  {profile.isEarlyAdopter ? (
                    <Badge variant="outline">
                      <SparklesIcon className="mr-1 h-3 w-3" />
                      Early adopter
                    </Badge>
                  ) : null}
                  {profile.lookingForGroup ? (
                    <Badge variant="outline">Buscando grupo</Badge>
                  ) : null}
                </div>
              </div>
            </div>

            {profile.bio ? (
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
            ) : null}

            {profile.location ? (
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPinIcon className="h-4 w-4" />
                {profile.location}
              </p>
            ) : null}

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Cadastro</dt>
                <dd>{formatDateTimePtBr(profile.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Atualizado</dt>
                <dd>{formatDateTimePtBr(profile.updatedAt)}</dd>
              </div>
              {profile.earlyAdopterGrantedAt ? (
                <div>
                  <dt className="text-muted-foreground">Early adopter desde</dt>
                  <dd>{formatDateTimePtBr(profile.earlyAdopterGrantedAt)}</dd>
                </div>
              ) : null}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Plano</dt>
                  <dd className="font-medium">
                    {PLAN_TIER_LABELS[subscription.planTier]}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline">{subscription.status}</Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Efetivamente ativo</dt>
                  <dd>
                    {subscription.isEffectivelyActive ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      "Não"
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Período atual</dt>
                  <dd>
                    {formatDatePtBr(subscription.currentPeriodStart)} –{" "}
                    {formatDatePtBr(subscription.currentPeriodEnd)}
                  </dd>
                </div>
                {subscription.cancelAtPeriodEnd ? (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">Cancelamento</dt>
                    <dd>Agendado ao fim do período</dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-2">
                  <ButtonLink
                    href={stripeSubscriptionDashboardUrl(
                      subscription.stripeSubscriptionId,
                    )}
                    label="Assinatura no Stripe"
                  />
                  {profile.stripeBillingCustomerId ? (
                    <ButtonLink
                      href={stripeCustomerDashboardUrl(
                        profile.stripeBillingCustomerId,
                      )}
                      label="Cliente no Stripe"
                    />
                  ) : null}
                </div>
              </dl>
            ) : (
              <p className="text-muted-foreground text-sm">
                Sem assinatura ativa registrada.
              </p>
            )}

            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Grupos (owner)</dt>
                <dd>
                  {data.planContext.ownedGroups} / {data.planContext.limits.maxGroups}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Links de convite ativos</dt>
                <dd>{data.planContext.activeInviteLinks}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UsersRoundIcon className="h-4 w-4" />
            Grupos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium">Como dono</h3>
            {data.ownedGroups.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum grupo.</p>
            ) : (
              <GroupTable
                rows={data.ownedGroups.map((g) => ({
                  code: g.code,
                  name: g.name,
                  meta: `${g.memberCount} membros`,
                  joinedAt: g.joinedAt,
                }))}
              />
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium">Como membro</h3>
            {data.memberGroups.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum grupo.</p>
            ) : (
              <GroupTable
                rows={data.memberGroups.map((g) => ({
                  code: g.code,
                  name: g.name,
                  meta: roleLabel(g.role),
                  joinedAt: g.joinedAt,
                }))}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tutorial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">
              {TUTORIAL_LABELS[data.tutorial.progress]}
            </Badge>
            <span className="text-muted-foreground">
              {data.tutorial.completedSections} de {data.tutorial.totalSections}{" "}
              seções concluídas
            </span>
          </div>
          {data.tutorial.sections.length > 0 ? (
            <ul className="space-y-2">
              {data.tutorial.sections.map((section) => (
                <li
                  key={section.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>{section.title}</span>
                  {section.isCompleted ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="text-muted-foreground text-xs">Pendente</span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <StarIcon className="h-4 w-4" />
            Feedbacks enviados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.feedbacks.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum feedback.</p>
          ) : (
            <div className="space-y-3">
              {data.feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="rounded-lg border p-3 text-sm"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {"★".repeat(feedback.rating)}
                      {"☆".repeat(5 - feedback.rating)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={feedback.isApproved ? "default" : "secondary"}
                      >
                        {feedback.isApproved ? "Aprovado" : "Pendente"}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatDatePtBr(feedback.createdAt)}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{feedback.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Partidas recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentMatches.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma partida.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partida</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confirmado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentMatches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.title}</TableCell>
                    <TableCell>
                      {match.groupCode ? (
                        <Link
                          href={`/admin/groups/${match.groupCode}`}
                          className="hover:underline"
                        >
                          {match.groupName ?? match.groupCode}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDatePtBr(match.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{match.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {match.confirmed ? "Sim" : "Não"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ButtonLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium"
    >
      {label}
      <ExternalLinkIcon className="h-3 w-3" />
    </a>
  );
}

function GroupTable({
  rows,
}: {
  rows: Array<{
    code: string;
    name: string;
    meta: string;
    joinedAt: string;
  }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Grupo</TableHead>
          <TableHead>Info</TableHead>
          <TableHead>Entrada</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.code}>
            <TableCell>
              <Link
                href={`/admin/groups/${row.code}`}
                className="font-medium hover:underline"
              >
                {row.name}
              </Link>
              <p className="text-muted-foreground font-mono text-xs">
                {row.code}
              </p>
            </TableCell>
            <TableCell>{row.meta}</TableCell>
            <TableCell>{formatDatePtBr(row.joinedAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
