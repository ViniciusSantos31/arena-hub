import { listTeamPlayers } from "@/actions/team/list";
import { Team } from "@/actions/team/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { useQuery } from "@tanstack/react-query";
import { Grid2x2CheckIcon } from "lucide-react";
import { Fragment } from "react";
import { TeamEmptyList } from "./team-empty-list";
import { TeamsListRealtime } from "./teams-list-realtime";

interface TeamsListProps {
  matchId: string;
}

const TeamCard = ({ team }: { team: Team }) => {
  return (
    <CardContent>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">Time {team.team}</h3>
        <Badge variant="secondary" className="text-sm">
          Score {team.score}
        </Badge>
      </div>
      <div className="grid gap-3">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="bg-muted/50 flex items-center justify-between rounded-lg p-3"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                {player.image && (
                  <AvatarImage
                    src={player.image}
                    alt={player.name || "Avatar"}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {getAvatarFallback(player.name || "")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{player.name}</span>
            </div>

            <Badge variant="outline" className="font-mono">
              {player.score}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default function TeamsList({ matchId }: TeamsListProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["teams", matchId],
    enabled: !!matchId,
    queryFn: async () =>
      await listTeamPlayers({
        matchId,
      }).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-foreground flex items-center gap-3 font-medium">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <Grid2x2CheckIcon className="text-muted-foreground h-5 w-5" />
            </div>
            Times
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <span className="text-lg font-semibold">Carregando times...</span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data || data.teams.length === 0) {
    return (
      <Card id="team-list-card">
        <CardHeader className="border-b">
          <CardTitle className="text-foreground flex items-center gap-3 font-medium">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <Grid2x2CheckIcon className="text-muted-foreground h-5 w-5" />
            </div>
            Times
          </CardTitle>
        </CardHeader>
        <TeamEmptyList />
      </Card>
    );
  }

  return (
    <TeamsListRealtime matchId={matchId}>
      <Card id="team-list-card">
        <CardHeader className="border-b">
          <CardTitle className="text-foreground flex items-center gap-3 font-medium">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <Grid2x2CheckIcon className="text-muted-foreground h-5 w-5" />
            </div>
            Times
          </CardTitle>
        </CardHeader>

        {data.teams.map((team) => (
          <Fragment key={team.team}>
            <TeamCard team={team} />
            <div className="my-6 h-px w-full border border-dashed last:hidden" />
          </Fragment>
        ))}
      </Card>
    </TeamsListRealtime>
  );
}
