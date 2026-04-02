import { useMemberStore } from "@/app/(protected)/group/[code]/_store/group";
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
import { formatBRL } from "@/lib/payments";
import { formatDate } from "@/utils/date";
import { getSportIconById, Sport } from "@/utils/sports";
import { Status } from "@/utils/status";
import { MatchStatusBadge } from "../../../_components/match-status-badge";
import { MatchStatusBadgeRealtime } from "../../../_components/match-status-badge-realtime";
import { JoinMatchButton } from "../_components/join-match-button";
import { useMatchPlayers } from "../_hooks";
import { useMatch } from "../_hooks/useMatch";
import { ConfirmPresenceButton } from "./confirm-presence-button";

export const MatchDetailCard = ({ code }: { code: string }) => {
  const { data: match, isLoading } = useMatch();
  const { data: matchPlayers } = useMatchPlayers(match?.id ?? "");
  const memberRole = useMemberStore((s) => s.member?.role);

  const filledPlayers = matchPlayers?.players.length ?? 0;
  const maxPlayers = match?.maxPlayers ?? 1;
  const progressValue = (filledPlayers * 100) / maxPlayers;

  const SportIcon = getSportIconById(match?.sport as Sport);

  if (isLoading || !match) {
    return <MatchDetailCardLoading />;
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <SportIcon className="text-primary h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{match?.title}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {filledPlayers} / {maxPlayers} vagas
          </span>
          {match.isPaid && match.totalPriceCents ? (
            <span className="text-foreground font-semibold">
              {formatBRL(Math.ceil(match.totalPriceCents / match.maxPlayers))}
              <span className="text-muted-foreground ml-1 text-xs font-normal">
                / pessoa
              </span>
            </span>
          ) : (
            <span className="text-primary font-semibold">Grátis</span>
          )}
        </div>
        <Progress value={progressValue} className="h-1.5" />
      </CardContent>
      <CardFooter className="gap-2 border-t pt-4">
        <JoinMatchButton
          match={{
            id: match.id,
            status: match.status,
            isPaid: match.isPaid,
            totalPriceCents: match.totalPriceCents,
            maxPlayers: match.maxPlayers,
          }}
          organizationCode={code}
          memberRole={memberRole}
        />
        <ConfirmPresenceButton matchId={match.id} matchStatus={match.status} />
      </CardFooter>
    </Card>
  );
};

export function MatchDetailCardLoading() {
  return (
    <div className="bg-card border-border/60 animate-pulse rounded-xl border">
      <div className="border-b p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <div className="bg-muted h-4 w-40 rounded" />
              <div className="bg-muted h-3 w-56 rounded" />
            </div>
          </div>
          <div className="bg-muted h-6 w-28 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex justify-between">
          <div className="bg-muted h-3.5 w-24 rounded" />
          <div className="bg-muted h-3.5 w-16 rounded" />
        </div>
        <div className="bg-muted h-1.5 w-full rounded-full" />
      </div>
      <div className="flex gap-2 border-t p-5">
        <div className="bg-muted h-9 flex-1 rounded-md" />
        <div className="bg-muted h-9 w-9 rounded-md" />
      </div>
    </div>
  );
}
