import { dashboardDetails } from "@/actions/dashboard/detail";
import { dashboardRanking } from "@/actions/dashboard/ranking";
import { getGroupDetails } from "@/actions/group/detail";
import { NewGroupChecklist } from "@/app/(protected)/group/[code]/overview/_components/new-group-checklist";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRightIcon,
  GlobeIcon,
  LockIcon,
  PlayIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { GroupRankingCard } from "./_components/group-ranking-card";
import { NextMatchCard } from "./_components/next-match-card";

export default async function GroupDashboardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const [details, groupRes, rankingRes] = await Promise.all([
    dashboardDetails({
      organizationCode: code,
    }),
    getGroupDetails({ code }),
    dashboardRanking({ organizationCode: code, limit: 10 }),
  ]);

  const group = groupRes.data;
  const ranking = rankingRes.data?.ranking ?? [];
  const matchesCount = details.data?.matchesCount ?? 0;
  const membersCount = details.data?.membersCount ?? 0;
  const isNewGroup = matchesCount === 0 && membersCount <= 1;

  return (
    <main className="grid w-full gap-4 @2xl:grid-cols-2">
      {isNewGroup && (
        <NewGroupChecklist
          code={code}
          matchesCount={matchesCount}
          membersCount={membersCount}
        />
      )}
      <NextMatchCard code={code} />

      {group ? (
        <section className="@2xl:col-span-2">
          <Card className="border-border/60">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span>Visão geral</span>
                <span className="text-muted-foreground font-mono text-xs tracking-wide">
                  {group.code}
                </span>
              </CardTitle>
              <CardDescription className="mt-1">
                {group.description ||
                  "Resumo do grupo e atalhos para as principais áreas."}
              </CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="flex flex-wrap gap-2">
                <span className="bg-muted/40 text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  {group.private ? (
                    <LockIcon className="text-muted-foreground h-3.5 w-3.5" />
                  ) : (
                    <GlobeIcon className="text-muted-foreground h-3.5 w-3.5" />
                  )}
                  {group.private ? "Grupo privado" : "Grupo público"}
                </span>
                <span className="bg-muted/40 text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                  <UsersIcon className="text-muted-foreground h-3.5 w-3.5" />
                  Até {group.maxPlayers} jogadores
                </span>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-3">
              <div className="flex w-full flex-wrap gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                >
                  <Link href={`/group/${code}/members`}>Ver membros</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                >
                  <Link href={`/group/${code}/matches`}>Ver partidas</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </section>
      ) : null}

      <GroupRankingCard
        me={rankingRes.data?.me}
        outOfRanking={rankingRes.data?.outOfRanking ?? false}
        ranking={ranking}
      />

      <section className="flex min-h-[400px] w-full flex-1 flex-col gap-4">
        <Card className="border-border/60 @container/card h-full w-full">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <PlayIcon className="text-primary h-4 w-4" />
                </div>
                Partidas
              </CardTitle>
              <CardAction className="hidden @[26rem]/card:flex">
                <Button
                  asChild
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                >
                  <Link href={`/group/${code}/matches`}>
                    Ver todas
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardAction>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4">
                <div className="text-foreground text-2xl font-bold">
                  {details.data?.matchesCount ?? 0}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Total de partidas
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl p-4">
                <div className="text-foreground text-2xl font-bold">
                  {details.data?.lastMonthMatchesCount ?? 0}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Últimos 30 dias
                </div>
              </div>
            </div>
            {/* {!!details.data?.matchesPercentageRate && (
              <div className="bg-primary/5 border-primary/10 mt-3 flex items-center gap-2 rounded-xl border p-3">
                <TrendingUpIcon className="text-primary h-4 w-4 shrink-0" />
                <span className="text-primary text-xs font-medium">
                  +{details.data?.matchesPercentageRate}% em relação ao período
                  anterior
                </span>
              </div>
            )} */}
          </CardContent>
          <CardFooter className="border-t pt-3 @[26rem]/card:hidden">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="ml-auto h-8 text-xs"
            >
              <Link href={`/group/${code}/matches`}>
                Ver partidas
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        <Card className="border-border/60 @container/card h-full w-full">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <UsersIcon className="text-primary h-4 w-4" />
                </div>
                Membros
              </CardTitle>
              <CardAction className="hidden @[28rem]/card:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-8 text-xs"
                >
                  <Link href={`/group/${code}/members`}>
                    Ver todos
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardAction>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/40 rounded-xl p-4">
                <div className="text-foreground text-2xl font-bold">
                  {details.data?.membersCount ?? 0}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Membros ativos
                </div>
              </div>
              <div className="bg-muted/40 rounded-xl p-4">
                <div className="text-foreground text-2xl font-bold">
                  {details.data?.membersRequestedCount ?? 0}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Solicitações
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 @[28rem]/card:hidden">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="ml-auto h-8 text-xs"
            >
              <Link href={`/group/${code}/members`}>
                Ver membros
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
