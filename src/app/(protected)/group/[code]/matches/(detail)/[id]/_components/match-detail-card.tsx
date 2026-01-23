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
import { formatDate } from "@/utils/date";
import { getSportIconById, Sport } from "@/utils/sports";
import { MatchStatusBadge } from "../../../_components/match-status-badge";
import { MatchStatusBadgeRealtime } from "../../../_components/match-status-badge-realtime";
import { JoinMatchButton } from "../_components/join-match-button";
import { useMatch } from "../_hooks/useMatch";
import { Status } from "../page";

export const MatchDetailCard = ({ code }: { code: string }) => {
  const { data: match, isLoading } = useMatch();

  const filledPlayers = match?.players.length ?? 0;
  const maxPlayers = match?.maxPlayers ?? 1;
  const progressValue = (filledPlayers * 100) / maxPlayers;

  const SportIcon = getSportIconById(match?.sport as Sport);

  if (isLoading || !match) {
    return <MatchDetailCardLoading />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-1 items-center gap-2">
          <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
            <SportIcon className="text-muted-foreground h-5 w-5" />
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
          <MatchStatusBadgeRealtime matchId={match.id}>
            <MatchStatusBadge status={match.status as Status} />
          </MatchStatusBadgeRealtime>
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
        <JoinMatchButton match={match} organizationCode={code} />
      </CardFooter>
    </Card>
  );
};

export function MatchDetailCardLoading() {
  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex flex-1 items-center gap-2">
          <div className="bg-muted h-10 w-10 animate-pulse rounded-lg"></div>
          <div className="flex flex-col justify-center gap-2">
            <div className="bg-muted h-6 w-48 animate-pulse rounded"></div>
            <div className="bg-muted h-4 w-64 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="ml-auto">
          <div className="bg-muted h-6 w-32 animate-pulse rounded-full"></div>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="bg-muted h-5 w-16 animate-pulse rounded"></div>
            <div className="bg-muted mt-1 h-4 w-32 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="mb-4 w-full">
          <div className="bg-muted h-1 w-full animate-pulse rounded"></div>
        </div>
      </div>

      <div className="flex items-center space-x-2 border-t p-6">
        <div className="bg-muted h-10 flex-1 animate-pulse rounded-md @md:w-48 @md:flex-none"></div>
        <div className="ml-auto flex gap-2">
          <div className="bg-muted hidden h-10 w-36 animate-pulse rounded-md @sm:block"></div>
          <div className="bg-muted h-10 w-10 animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  );
}
