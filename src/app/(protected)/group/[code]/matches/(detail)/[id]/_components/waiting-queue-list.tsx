import { CardContent } from "@/components/ui/card";
import { useWaitingQueue } from "../_hooks";
import { PlayerItem } from "./player-item";

export const WaitingQueueList = ({ id }: { id: string }) => {
  const { data: players, isLoading } = useWaitingQueue(id);

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
        {players?.map((player) => (
          <PlayerItem key={player.id} player={player} />
        ))}
      </CardContent>
    </>
  );
};
