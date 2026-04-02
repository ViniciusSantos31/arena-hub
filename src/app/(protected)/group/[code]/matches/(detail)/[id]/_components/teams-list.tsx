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
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Time {team.team}</h3>
        <Badge variant="secondary" className="text-xs">
          Score {Math.round(team.score)}
        </Badge>
      </div>
      <div className="space-y-1.5">
        {team.players.map((player) => (
          <div
            key={player.id}
            className="bg-muted/40 hover:bg-muted/60 flex items-center justify-between rounded-xl px-3 py-2 transition-colors"
          >
            <div className="flex items-center gap-2.5">
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
            <span className="text-muted-foreground text-xs font-medium">
              {player.score} pts
            </span>
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

  const CardHeaderContent = () => (
    <CardHeader className="border-b pb-4">
      <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
          <Grid2x2CheckIcon className="text-primary h-4 w-4" />
        </div>
        Times
      </CardTitle>
    </CardHeader>
  );

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeaderContent />
        <CardContent className="flex flex-col items-center justify-center py-8">
          <span className="text-muted-foreground text-sm">
            Carregando times...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data || data.teams.length === 0) {
    return (
      <Card id="team-list-card" className="border-border/60">
        <CardHeaderContent />
        <TeamEmptyList />
      </Card>
    );
  }

  return (
    <TeamsListRealtime matchId={matchId}>
      <Card id="team-list-card" className="border-border/60">
        <CardHeaderContent />
        {data.teams.map((team) => (
          <Fragment key={team.team}>
            <TeamCard team={team} />
            <div className="border-border/40 mx-4 border-t border-dashed last:hidden" />
          </Fragment>
        ))}
      </Card>
    </TeamsListRealtime>
  );
}
