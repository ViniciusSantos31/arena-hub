"use client";

import { Player, Team } from "@/actions/team/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShuffleIcon } from "lucide-react";
import { use, useState } from "react";
import { DroppableTeamsList } from "./_components/droppable-teams-list";
import { EmptyTeamList } from "./_components/empty-team-list";
import { SaveTeamsConfigButton } from "./_components/save-teams-config-button";
import { useSortTeams } from "./_hooks";

export default function SortTeamsPage({
  params,
}: {
  params: Promise<{ code: string; id: string }>;
}) {
  const { code, id: matchId } = use(params);

  const [nTeams, setNTeams] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [reserves, setReserves] = useState<Player[]>([]);

  const { mutate } = useSortTeams({
    onSuccess: (data) => {
      setTeams(data?.teams ?? []);
      setReserves(data?.reserves ?? []);
    },
  });

  const playersPerTeam =
    teams.reduce((acc, team) => acc + team.players.length, 0) / nTeams;
  const canSaveConfiguration =
    teams.length > 0 &&
    reserves.length === 0 &&
    teams.every((team) => team.players.length > 0) &&
    teams.every((team) => team.players.length === playersPerTeam);

  return (
    <div className="grid gap-4 @md:grid-cols-1">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de equipes</CardTitle>
            <CardDescription>
              Defina a quantidade de equipes e sorteie os jogadores
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input
              placeholder="Quantidade de equipes"
              type="number"
              value={nTeams}
              onChange={(e) => setNTeams(Number(e.target.value))}
            />
            <div className="flex w-full gap-2">
              <Button
                variant={"outline"}
                type="button"
                className="ml-auto"
                onClick={() =>
                  mutate({ matchId, organizationCode: code, nTeams })
                }
              >
                <ShuffleIcon />
                Sortear
              </Button>
              <SaveTeamsConfigButton
                matchId={matchId}
                teams={teams}
                reserves={reserves}
                canSaveConfiguration={canSaveConfiguration}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {teams.length === 0 && <EmptyTeamList />}

      <div className="flex flex-col gap-4">
        <DroppableTeamsList
          teams={teams}
          setTeams={setTeams}
          reserves={reserves}
          setReserves={setReserves}
        />
      </div>
    </div>
  );
}
