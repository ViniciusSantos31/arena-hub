"use client";

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
import { getAvatarFallback } from "@/utils/avatar";
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

interface Player {
  id: string;
  name: string;
  avatar?: string;
  score?: number;
}

type Status = "open" | "full" | "closed" | "canceled";

interface Match {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  maxPlayers: number;
  currentPlayers: number;
  description: string;
  status: Status;
  players: Player[];
}

// Mock data - replace with actual data fetching
const mockMatch: Match = {
  id: "1",
  title: "Futebol no Parque",
  date: "2024-01-20",
  time: "18:00",
  location: "Parque Ibirapuera, São Paulo",
  maxPlayers: 10,
  currentPlayers: 6,
  description: "Partida amistosa de futebol. Venha se divertir conosco!",
  status: "closed",
  players: [
    { id: "1", name: "João Silva", score: 10 },
    { id: "2", name: "Maria Santos", score: 8 },
    { id: "3", name: "Pedro Oliveira", score: 7 },
    { id: "4", name: "Ana Costa", score: 9 },
    { id: "5", name: "Carlos Lima", score: 6 },
    { id: "6", name: "Lucia Ferreira", score: 5 },
  ],
};

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}) {
  const { id } = use(params);
  const match = mockMatch; // Replace with actual data fetching using params.id

  const router = useRouter();

  const handleJoinMatch = () => {
    // Implement join match logic
    console.log("Joining match:", id);
  };

  const matchStatusConfig: Record<Status, { label: string; color: string }> = {
    open: { label: "Aberta", color: "bg-primary" },
    full: { label: "Cheia", color: "bg-yellow-500" },
    closed: { label: "Fechada", color: "bg-muted text-muted-foreground" },
    canceled: { label: "Cancelada", color: "bg-red-500 text-white" },
  };

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
              <CardTitle>{match.title}</CardTitle>
              <CardDescription>
                {new Date(match.date).toLocaleDateString()} • {match.time}
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
                {12} de {20}
              </p>
              <p className="text-muted-foreground text-sm">vagas preenchidas</p>
            </div>
          </div>
          <div className="mb-4 w-full">
            <Progress value={60} className="h-1" />
          </div>
        </CardContent>
        <CardFooter className="w-full space-x-2 border-t">
          <Button
            disabled={match.status !== "open"}
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
            {match.players.map((player) => (
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
            ))}
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
