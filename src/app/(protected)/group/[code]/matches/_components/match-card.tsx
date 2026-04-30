import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { matchesTable } from "@/db/schema/match";
import { getCategoryLabelById } from "@/utils/categories";
import { formatDate } from "@/utils/date";
import { getSportIconById, getSportLabelById, Sport } from "@/utils/sports";
import Link from "next/link";
import { AvatarStack } from "./avatar-stack";
import { MatchStatusBadge } from "./match-status-badge";

type MatchCardProps = {
  match: typeof matchesTable.$inferSelect & {
    players: {
      waitingQueue: boolean;
      id?: string | undefined;
      name?: string | undefined;
      image?: string | null | undefined;
    }[];
  };
};

export const MatchCard = ({ match }: MatchCardProps) => {
  const filledPlayers = match.players.filter(
    (player) => player?.waitingQueue === false,
  ).length;
  const progressValue = (filledPlayers * 100) / match.maxPlayers;

  const SportIcon = getSportIconById(match.sport as Sport);

  return (
    <Link href={`matches/${match.id}`} className="group w-full">
      <Card className="border-border/60 hover:border-primary/20 h-full transition-all duration-200">
        <CardHeader className="gap-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-1 items-center gap-3">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                <SportIcon className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base">
                  {match.title}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs">
                  {getSportLabelById(match.sport)} ·{" "}
                  {getCategoryLabelById(match.category)}
                </CardDescription>
              </div>
            </div>
            <MatchStatusBadge status={match.status} />
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span>
              {formatDate(
                match.date,
                "dddd[,] DD [de] MMM [de] YYYY [•] HH[:]mm",
              )}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {filledPlayers} / {match.maxPlayers} vagas
              </span>
              <span className="text-primary text-sm font-semibold">Grátis</span>
            </div>
            <Progress value={progressValue} className="h-1.5" />
          </div>

          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className="truncate">{match.location}</span>
          </div>

          <div>
            <Label className="text-muted-foreground mb-2 block text-xs">
              Participantes
            </Label>
            {filledPlayers === 0 ? (
              <span className="text-muted-foreground text-xs">
                Nenhum participante ainda.
              </span>
            ) : (
              <AvatarStack users={match.players} />
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const MatchCardLoading = () => {
  return (
    <Card className="border-border/60 w-full animate-pulse">
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-4 w-1/3 rounded" />
            <div className="bg-muted h-3 w-1/2 rounded" />
          </div>
        </div>
        <div className="bg-muted h-3 w-2/3 rounded" />
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="bg-muted h-3.5 w-20 rounded" />
            <div className="bg-muted h-3.5 w-16 rounded" />
          </div>
          <div className="bg-muted h-1.5 w-full rounded-full" />
        </div>
        <div className="bg-muted h-3 w-32 rounded" />
        <div className="flex -space-x-2">
          <div className="bg-muted h-8 w-8 rounded-full" />
          <div className="bg-muted h-8 w-8 rounded-full" />
          <div className="bg-muted h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
};
