import { listMatchPlayers } from "@/actions/match/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { PlayerEmptyList } from "./player-empty-list";

export const PlayersList = ({ id }: { id: string }) => {
  const { data: players, isLoading } = useQuery({
    queryKey: ["players", id],
    enabled: !!id,
    queryFn: async () =>
      listMatchPlayers({ matchId: id }).then((res) => res.data),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return (
      <CardContent className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="bg-muted h-10 w-full animate-pulse rounded-md"
          />
        ))}
      </CardContent>
    );
  }

  if (
    !players ||
    (players.players.length === 0 && players.waitingQueue.length === 0)
  ) {
    return <PlayerEmptyList />;
  }

  return (
    <CardContent className="space-y-4">
      {players?.players.map((player) => (
        <div key={player.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              className={cn(
                "relative size-10 overflow-visible",
                player.confirmed
                  ? "ring-primary ring-offset-card ring-2 ring-offset-2"
                  : "ring-muted-foreground/10 ring-offset-card ring-2 ring-offset-2",
              )}
            >
              <div
                className={cn(
                  "ring-card absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full ring-2",
                  player.confirmed ? "bg-primary" : "bg-muted",
                )}
              >
                {player.confirmed ? (
                  <CheckIcon className="size-3" />
                ) : (
                  <LoaderIcon className="size-3" />
                )}
              </div>
              <AvatarFallback className="rounded-full">
                {getAvatarFallback(player.name)}
              </AvatarFallback>
              <AvatarImage
                className="rounded-full"
                src={player.image || undefined}
              />
            </Avatar>
            <span>{player.name}</span>
          </div>
          {player.score !== undefined && (
            <span className="text-muted-foreground text-sm font-medium">
              {player.score} pts
            </span>
          )}
        </div>
      ))}
    </CardContent>
  );
};
