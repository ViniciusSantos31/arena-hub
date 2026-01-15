"use client";

import { matchDetails } from "@/actions/match/list";
import { Badge } from "@/components/ui/badge";
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
import { Progress } from "@/components/ui/progress";
import { matchStatusEnum } from "@/db/schema/match";
import { getAvatarFallback } from "@/utils/avatar";
import { formatDate } from "@/utils/date";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  MoreVerticalIcon,
  PlayIcon,
  ShuffleIcon,
  Users2Icon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { PiSoccerBall } from "react-icons/pi";
import MatchDetailLoading from "./loading";

type Status = (typeof matchStatusEnum.enumValues)[number];

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}) {
  const { id } = use(params);

  const { data: match, isLoading } = useQuery({
    queryKey: ["match", id],
    enabled: !!id,
    queryFn: async () => matchDetails({ matchId: id }).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

  const router = useRouter();

  const handleJoinMatch = () => {
    // Implement join match logic
    console.log("Joining match:", id);
  };

  const matchStatusConfig: Record<Status, { label: string; color: string }> = {
    open_registration: { label: "Inscrições Abertas", color: "bg-green-500" },
    closed_registration: {
      label: "Inscrições Fechadas",
      color: "bg-yellow-500",
    },
    completed: { label: "Concluída", color: "bg-blue-500 text-white" },
    scheduled: { label: "Agendada", color: "bg-purple-500 text-white" },
    team_sorted: {
      label: "Times Sorteados",
      color: "bg-indigo-500 text-white",
    },
    canceled: { label: "Cancelada", color: "bg-red-500 text-white" },
  };

  const filledPlayers = match?.players.length ?? 0;
  const maxPlayers = match?.maxPlayers ?? 1;
  const progressValue = (filledPlayers * 100) / maxPlayers;

  if (isLoading || !id || !match) {
    return <MatchDetailLoading />;
  }

  return (
    <main className="flex flex-col gap-4">
      <Button variant="link" className="w-fit p-0" onClick={router.back}>
        <ChevronLeftIcon />
        Voltar para as Partidas
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-1 items-center gap-2">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <PiSoccerBall className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <CardTitle>{match?.title}</CardTitle>
              <CardDescription>
                {formatDate(
                  match.date,
                  "dddd[,] DD [de] MMM [de] YYYY [•] HH[:]mm",
                )}
              </CardDescription>
            </div>
          </div>
          <CardAction>
            <Badge className={matchStatusConfig[match.status].color}>
              {matchStatusConfig[match.status].label}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p>
                {filledPlayers} de {maxPlayers}
              </p>
              <p className="text-muted-foreground text-sm">vagas preenchidas</p>
            </div>
          </div>
          <div className="mb-4 w-full">
            <Progress value={progressValue} className="h-1" />
          </div>
        </CardContent>
        <CardFooter className="w-full space-x-2 border-t">
          <Button
            disabled={match.status !== "open_registration"}
            className="flex-1 @md:flex-none"
            onClick={handleJoinMatch}
          >
            <PlayIcon />
            <span className="hidden @md:block">Participar da Partida</span>
            <span className="@md:hidden">Participar</span>
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" className="hidden @sm:flex">
              <ShuffleIcon />
              <span className="hidden @md:block">Realizar sorteio</span>
              <span className="@md:hidden">Sortear</span>
            </Button>
            <Button size={"icon"} variant={"outline"}>
              <MoreVerticalIcon />
            </Button>
          </div>
        </CardFooter>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-3 font-medium">
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                <Users2Icon className="text-muted-foreground h-5 w-5" />
              </div>
              Jogadores participantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {match.players.map(
              (player) =>
                player && (
                  <div
                    key={player.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-muted/50 flex h-10 w-10 items-center justify-center rounded-full">
                        {getAvatarFallback(player.name)}
                      </div>
                      <span>{player.name}</span>
                    </div>
                    {player.score !== undefined && (
                      <span className="text-muted-foreground text-sm font-medium">
                        {player.score} pts
                      </span>
                    )}
                  </div>
                ),
            )}
          </CardContent>
          <div className="relative flex items-center py-4">
            <div className="border-muted-foreground/30 flex-1 divide-dashed border-t border-dashed"></div>
            <div className="text-muted-foreground bg-card px-4 text-xs">
              Lista de Espera
            </div>
            <div className="border-muted-foreground/30 flex-1 border-t border-dashed"></div>
          </div>
        </Card>
      </div>
    </main>
  );
}
