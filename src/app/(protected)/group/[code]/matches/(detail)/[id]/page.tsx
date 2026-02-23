"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";
import { ChevronLeftIcon, RotateCcwIcon, Users2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { AdvancedSettingsSection } from "./_components/advanced-settings-section";
import { MatchDetailCard } from "./_components/match-detail-card";
import { PlayerListRealtime } from "./_components/player-list-realtime";
import { PlayersList } from "./_components/players-list";
import TeamsList from "./_components/teams-list";
import { WaitingQueueList } from "./_components/waiting-queue-list";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}) {
  const { id, code } = use(params);

  const router = useRouter();

  const { listenMatchEvents, isConnected, reconnect } = useWebSocket();

  useEffect(() => {
    listenMatchEvents(id);
  }, [id, listenMatchEvents]);

  return (
    <main className="flex flex-col gap-4">
      <Button variant="outline" className="w-fit" onClick={router.back}>
        <ChevronLeftIcon />
        Voltar para as partidas
      </Button>

      <div>
        {!isConnected && (
          <Card className="border-destructive bg-destructive/5 dark:bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">
                Conexão perdida
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                A conexão com o servidor foi perdida. Você ainda pode realizar
                ações na partida, mas não receberá atualizações em tempo real.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" onClick={reconnect}>
                <RotateCcwIcon />
                Tentar reconectar
              </Button>
            </CardFooter>
          </Card>
        )}
        {isConnected && (
          <Card className="border-primary dark:bg-primary/5 bg-primary/5 relative overflow-clip">
            <CardHeader>
              <CardTitle>Conectado</CardTitle>
              <CardDescription className="text-muted-foreground text-balance">
                Você está conectado ao servidor. As informações da partida estão
                sendo atualizadas em tempo real.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>

      <AdvancedSettingsSection />

      <MatchDetailCard code={code} />

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
          <PlayerListRealtime matchId={id}>
            <PlayersList id={id} />
            <WaitingQueueList id={id} />
          </PlayerListRealtime>
        </Card>
      </div>
      <TeamsList matchId={id} />
    </main>
  );
}
