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
import { MemberSubscriptionCard } from "./_components/member-subscription-card";
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
      <section className="flex w-full flex-1 flex-col gap-4">
        <NextMatchCard code={code} />

        <Card className="@container/card border-border/60 w-full">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <PlayIcon className="text-primary h-4 w-4" />
                </div>
                Partidas
              </CardTitle>
              <CardAction className="hidden @[26rem]/card:flex">
                <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
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
            {!!details.data?.matchesPercentageRate && (
              <div className="bg-primary/5 border-primary/10 mt-3 flex items-center gap-2 rounded-xl border p-3">
                <TrendingUpIcon className="text-primary h-4 w-4 shrink-0" />
                <span className="text-primary text-xs font-medium">
                  +{details.data?.matchesPercentageRate}% em relação ao período anterior
                </span>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 @[26rem]/card:hidden">
            <Button variant="outline" size="sm" asChild className="ml-auto h-8 text-xs">
              <Link href={`/group/${code}/matches`}>
                Ver partidas
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section className="flex h-fit w-full flex-1 flex-col gap-4">
        <MemberSubscriptionCard organizationCode={code} />

        <Card className="@container/card border-border/60 w-full">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <UsersIcon className="text-primary h-4 w-4" />
                </div>
                Membros
              </CardTitle>
              <CardAction className="hidden @[28rem]/card:flex">
                <Button variant="ghost" size="sm" asChild className="h-8 text-xs">
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
                <div className="text-foreground text-2xl font-bold">0</div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Solicitações
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3 @[28rem]/card:hidden">
            <Button variant="outline" size="sm" asChild className="ml-auto h-8 text-xs">
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
