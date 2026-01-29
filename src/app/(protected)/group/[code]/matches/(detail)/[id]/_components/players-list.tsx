import { listMatchPlayers } from "@/actions/match/player";
import { CardContent } from "@/components/ui/card";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PlayerEmptyList } from "./player-empty-list";
import { PlayerItem } from "./player-item";

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
        <PlayerItem key={player.id} player={player} />
      ))}
    </CardContent>
  );
};
