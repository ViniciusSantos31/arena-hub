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
import { useGuard } from "@/hooks/use-guard";
import { formatDate } from "@/utils/date";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MoreVerticalIcon, ShuffleIcon } from "lucide-react";
import { PiSoccerBall } from "react-icons/pi";
import { JoinMatchButton } from "../_components/join-match-button";
import { Status } from "../page";

export const MatchDetailCard = ({ id, code }: { id: string; code: string }) => {
  const { data: match, isLoading } = useQuery({
    queryKey: ["match", id],
    enabled: !!id,
    queryFn: async () => matchDetails({ matchId: id }).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

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

  const canModifyMatch = useGuard({
    action: ["match:update", "team:create"],
  });

  if (isLoading || !match || !id) {
    return <MatchDetailCardLoading />;
  }

  return (
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
        <JoinMatchButton match={match} organizationCode={code} />

        {canModifyMatch && (
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
        )}
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
