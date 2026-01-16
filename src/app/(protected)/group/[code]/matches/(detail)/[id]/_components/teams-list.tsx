import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { DicesIcon, Grid2x2CheckIcon } from "lucide-react";
import { Fragment } from "react";

interface Player {
  id: string;
  name: string;
  avatar?: string;
  score: number;
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  averageScore: number;
}

interface TeamsListProps {
  teams: Team[];
}

const TeamCard = ({ team }: { team: Team }) => {
  return (
    <CardContent>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold">{team.name}</h3>
        <Badge variant="secondary" className="text-sm">
          Média: {team.averageScore}
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
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback className="text-xs">
                  {getAvatarFallback(player.name)}
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

export default function TeamsList({ teams }: TeamsListProps) {
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
      {teams.length === 0 && (
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <DicesIcon className="mb-3 size-11" />
          <div className="space-y-1">
            <span className="text-lg font-semibold">Calma lá!</span>
            <p className="text-muted-foreground text-center text-sm">
              Os times ainda não foram sorteados para essa partida.
            </p>
          </div>
        </CardContent>
      )}
      {teams.map((team) => (
        <Fragment key={team.id}>
          <TeamCard team={team} />
          <div className="my-6 h-px w-full border border-dashed last:hidden" />
        </Fragment>
      ))}
    </Card>
  );
}
