import { dashboardDetails } from "@/actions/dashboard/detail";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRightIcon,
  PlayIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { NextMatchCard } from "./_components/next-match-card";

export default async function GroupDashboardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const details = await dashboardDetails({
    organizationCode: code,
  });
  return (
    <main className="grid w-full gap-4 @2xl:grid-cols-2">
      <section className="flex w-full flex-1 flex-wrap gap-4">
        <NextMatchCard code={code} />

        {/* Matches Section */}
        <Card className="bg-card @container/card w-full border shadow-sm">
          <CardHeader className="border-b pb-6">
            <CardTitle className="text-foreground flex items-center gap-3 font-medium">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <PlayIcon className="text-muted-foreground h-5 w-5" />
              </div>
              Estatísticas de Partidas
            </CardTitle>
            <CardAction className="hidden @[26rem]/card:flex">
              <Button asChild className="ml-auto">
                <Link href={`/group/${code}/matches`} aria-label="Ver partidas">
                  Ver partidas
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">
                  {details.data?.matchesCount}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Total de Partidas
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">
                  {details.data?.lastMonthMatchesCount}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Últimos 30 dias
                </div>
              </div>
            </div>
            {!!details.data?.matchesPercentageRate && (
              <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
                <TrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Aumento de {details.data?.matchesPercentageRate}% em relação
                  ao período anterior
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex border-t @[26rem]/card:hidden">
            <Button
              variant="outline"
              size="default"
              asChild
              className="ml-auto"
            >
              <Link href={`/group/${code}/matches`} aria-label="Ver partidas">
                Ver partidas
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex h-fit w-full flex-1 flex-wrap gap-4">
        {/* Members Section */}
        <Card className="bg-card @container/card w-full border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-foreground flex items-center gap-3 font-medium">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <UsersIcon className="text-muted-foreground h-5 w-5" />
              </div>
              Gerenciamento de Membros
            </CardTitle>
            <CardAction className="hidden @[28rem]/card:flex">
              <Button variant="outline" size="default" asChild>
                <Link
                  href={`/group/${code}/members`}
                  aria-label="Ver todos os membros"
                >
                  Ver Membros
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">
                  {details.data?.membersCount}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  Membros Ativos
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">0</div>
                <div className="text-muted-foreground text-sm font-medium">
                  Solicitações Pendentes
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex border-t @[28rem]/card:hidden">
            <Button
              variant="outline"
              size="default"
              asChild
              className="ml-auto"
            >
              <Link
                href={`/group/${code}/members`}
                aria-label="Ver todos os membros"
              >
                Ver Membros
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
