import { CardContent } from "@/components/ui/card";
import { useMatchPlayers } from "../_hooks";
import { PlayerEmptyList } from "./player-empty-list";
import { PlayerItem } from "./player-item";

export const PlayersList = ({ id }: { id: string }) => {
  const { data: players, isLoading } = useMatchPlayers(id);

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
