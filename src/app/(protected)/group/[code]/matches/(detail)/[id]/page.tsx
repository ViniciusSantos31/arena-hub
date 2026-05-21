"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/use-websocket";
import { ChevronLeftIcon, Users2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, use, useEffect } from "react";
import { AdvancedSettingsSection } from "./_components/advanced-settings-section";
import { CheckoutReturnHandler } from "./_components/checkout-return-handler";
import { MatchDetailCard } from "./_components/match-detail-card";
import { PlayerListRealtime } from "./_components/player-list-realtime";
import { PlayersList } from "./_components/players-list";
import { SocketStatusBadge } from "./_components/socket-status-badge";
import TeamsList from "./_components/teams-list";
import { WaitingQueueList } from "./_components/waiting-queue-list";

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}) {
  const { id, code } = use(params);

  const router = useRouter();

  const { listenMatchEvents } = useWebSocket();

  useEffect(() => {
    listenMatchEvents(id);
  }, [id, listenMatchEvents]);

  return (
    <main className="flex w-full flex-col gap-4">
      <Suspense fallback={null}>
        <CheckoutReturnHandler matchId={id} organizationCode={code} />
      </Suspense>
      <section className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <Button variant="ghost" size="sm" className="w-fit gap-1.5 pl-1" onClick={router.back}>
          <ChevronLeftIcon className="size-4" />
          Voltar
        </Button>
        <div className="sm:ml-auto">
          <SocketStatusBadge />
        </div>
      </section>

      <AdvancedSettingsSection />

      <MatchDetailCard code={code} />

      <Card className="border-border/60">
        <CardHeader className="border-b pb-4">
          <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
              <Users2Icon className="text-primary h-4 w-4" />
            </div>
            Jogadores participantes
          </CardTitle>
        </CardHeader>
        <PlayerListRealtime matchId={id}>
          <PlayersList id={id} organizationCode={code} />
          <WaitingQueueList id={id} organizationCode={code} />
        </PlayerListRealtime>
      </Card>

      <TeamsList matchId={id} />
    </main>
  );
}
