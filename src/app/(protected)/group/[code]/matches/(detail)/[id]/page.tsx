"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { matchStatusEnum } from "@/db/schema/match";
import { ChevronLeftIcon, Users2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { AdvancedSettingsSection } from "./_components/advanced-settings-section";
import { MatchDetailCard } from "./_components/match-detail-card";
import { PlayersList } from "./_components/players-list";
import TeamsList from "./_components/teams-list";

export type Status = (typeof matchStatusEnum.enumValues)[number];

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; code: string }>;
}) {
  const { id, code } = use(params);

  const router = useRouter();

  return (
    <main className="flex flex-col gap-4">
      <Button variant="secondary" className="w-fit" onClick={router.back}>
        <ChevronLeftIcon />
        Voltar para as Partidas
      </Button>

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
          <PlayersList id={id} />
          <div className="relative flex items-center py-4">
            <div className="border-muted-foreground/30 flex-1 divide-dashed border-t border-dashed"></div>
            <div className="text-muted-foreground bg-card px-4 text-xs">
              Lista de Espera
            </div>
            <div className="border-muted-foreground/30 flex-1 border-t border-dashed"></div>
          </div>
        </Card>
      </div>
      <TeamsList matchId={id} />
    </main>
  );
}
