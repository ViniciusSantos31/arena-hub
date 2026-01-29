import { listMatchPlayers } from "@/actions/match/player";
import { CardContent } from "@/components/ui/card";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PlayerItem } from "./player-item";

export const WaitingQueueList = ({ id }: { id: string }) => {
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

  if (!players || players.waitingQueue.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative flex items-center py-4">
        <div className="border-muted-foreground/30 flex-1 divide-dashed border-t border-dashed"></div>
        <div className="text-muted-foreground bg-card px-4 text-xs">
          Lista de Espera
        </div>
        <div className="border-muted-foreground/30 flex-1 border-t border-dashed"></div>
      </div>
      <CardContent className="space-y-4">
        {players?.waitingQueue.map((player) => (
          <PlayerItem key={player.id} player={player} />
        ))}
      </CardContent>
    </>
  );
};
