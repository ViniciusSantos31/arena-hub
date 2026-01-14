import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { MatchCard } from "../matches/_components/match-card";

export default function GroupDashboardPage() {
  return (
    <main className="grid w-full gap-4 @2xl:grid-cols-2">
      <section className="flex w-full flex-1 flex-wrap gap-4">
        <MatchCard />

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
              <Button
                variant="default"
                size="default"
                asChild
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="#" aria-label="Criar nova partida">
                  Nova Partida
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">49</div>
                <div className="text-muted-foreground text-sm font-medium">
                  Total de Partidas
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">23</div>
                <div className="text-muted-foreground text-sm font-medium">
                  Últimos 30 dias
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950">
              <TrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Aumento de 15% em relação ao período anterior
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex border-t @[26rem]/card:hidden">
            <Button
              variant="outline"
              size="default"
              asChild
              className="ml-auto"
            >
              <Link href="#" aria-label="Criar nova partida">
                Nova Partida
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
                <Link href="#" aria-label="Ver todos os membros">
                  Ver Membros
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">49</div>
                <div className="text-muted-foreground text-sm font-medium">
                  Membros Ativos
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-foreground text-3xl font-semibold">12</div>
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
              <Link href="#" aria-label="Ver todos os membros">
                Ver Membros
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Rankings Section */}
        <Card className="bg-card @container/card w-full border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-foreground flex items-center gap-3 font-medium">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <TrophyIcon className="text-muted-foreground h-5 w-5" />
              </div>
              Ranking de Performance
            </CardTitle>
            <CardAction className="hidden @[28rem]/card:flex">
              <Button variant="outline" size="default" asChild>
                <Link href="#" aria-label="Ver todas as classificações">
                  Ver Ranking Completo
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                    1
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                      RV
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground font-medium">
                    Raissa Vieira
                  </span>
                </div>
                <div className="text-foreground text-sm font-semibold">
                  1,250 pts
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary text-secondary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                    2
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                      VS
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground font-medium">
                    Vinicius Santos
                  </span>
                </div>
                <div className="text-foreground text-sm font-semibold">
                  1,180 pts
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
              <Link href="#" aria-label="Ver todas as classificações">
                Ver Ranking Completo
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </main>
  );
}
