import { listMatchPlayers } from "@/actions/match/player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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

  if (!players || players.length === 0) {
    return <PlayerEmptyList />;
  }

  return (
    <CardContent className="space-y-4">
      {players?.map(
        (player) =>
          player && (
            <div key={player.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>
                    {getAvatarFallback(player.name)}
                  </AvatarFallback>
                  <AvatarImage src={player.image || undefined} />
                </Avatar>
                <span>{player.name}</span>
              </div>
              {player.score !== undefined && (
                <span className="text-muted-foreground text-sm font-medium">
                  {player.score} pts
                </span>
              )}
            </div>
          ),
      )}
    </CardContent>
  );
};
