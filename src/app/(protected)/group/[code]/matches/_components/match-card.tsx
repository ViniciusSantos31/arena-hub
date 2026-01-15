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
import { getSportLabelById } from "@/utils/sports";
import Link from "next/link";
import { AvatarStack } from "./avatar-stack";

type MatchCardProps = {
  match: typeof matchesTable.$inferSelect & {
    players: (
      | {
          id: string;
          name: string;
          image: string | null;
        }
      | undefined
    )[];
  };
};

export const MatchCard = ({ match }: MatchCardProps) => {
  const filledPlayers = match.players.length;
  const progressValue = (match.players.length * 100) / match.maxPlayers;

  return (
    <Link href={`matches/${match.id}`} className="group w-full rounded-xl">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>{match.title}</CardTitle>
          <CardDescription>
            {getSportLabelById(match.sport)} •{" "}
            {getCategoryLabelById(match.category)} •{" "}
            {formatDate(
              match.date,
              "dddd[,] DD [de] MMM [de] YYYY [•] HH[:]mm",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <span className="leading-6">
                {filledPlayers} de {match.maxPlayers}
              </span>
              <p className="text-muted-foreground text-sm">vagas preenchidas</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">Grátis</p>
              {/* <p className="text-muted-foreground text-sm">por pessoa</p> */}
            </div>
          </div>
          <div className="mb-4 w-full">
            <Progress value={progressValue} className="h-1" />
          </div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Local:</p>
              <p className="text-muted-foreground text-sm">{match.location}</p>
            </div>
          </div>
          <div className="mt-auto">
            <Label className="mb-4">Participantes:</Label>
            {filledPlayers === 0 && (
              <span className="text-muted-foreground block text-sm leading-8">
                Nenhum participante ainda.
              </span>
            )}
            <AvatarStack users={match.players} />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const MatchCardLoading = () => {
  return (
    <Card className="box-border flex w-full animate-pulse">
      <CardHeader>
        <CardTitle className="bg-muted h-4 w-1/3 rounded-md" />
        <CardDescription className="bg-muted mt-1 h-5 w-1/2 rounded-md" />
      </CardHeader>
      <CardContent className="flex h-full flex-col">
        <div className="mb-2 flex h-11 items-center justify-between">
          <div>
            <div className="bg-muted h-6 w-12 rounded-md" />
            <div className="bg-muted mt-1 h-5 w-20 rounded-md" />
          </div>
          <div className="text-right">
            <div className="bg-muted h-7 w-16 rounded-md" />
            {/* <div className="mt-1 h-3 w-20 rounded-md bg-muted" /> */}
          </div>
        </div>
        <div className="mb-4 w-full">
          <div className="bg-muted h-2 w-full rounded-md" />
        </div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="bg-muted h-4 w-16 rounded-md" />
            <div className="bg-muted mt-1 h-3 w-32 rounded-md" />
          </div>
        </div>
        <div className="mt-auto">
          <div className="bg-muted mb-4 h-3.5 w-24 rounded-md" />
          <div className="flex -space-x-2">
            <div className="bg-muted h-8 w-8 rounded-full" />
            <div className="bg-muted h-8 w-8 rounded-full" />
            <div className="bg-muted h-8 w-8 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
