import { CardContent } from "@/components/ui/card";
import { useGuard } from "@/hooks/use-guard";
import { useWaitingQueue } from "../_hooks";
import { PlayerItem } from "./player-item";

interface WaitingQueueListProps {
  id: string;
  organizationCode: string;
}

export const WaitingQueueList = ({
  id,
  organizationCode,
}: WaitingQueueListProps) => {
  const { data: players, isLoading } = useWaitingQueue(id);
  const canModerate = useGuard({ action: ["match:update"] });

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
      <div className="relative flex items-center px-4 py-3">
        <div className="border-border/50 flex-1 border-t border-dashed" />
        <span className="text-muted-foreground bg-card px-3 text-xs font-medium">
          Lista de espera
        </span>
        <div className="border-border/50 flex-1 border-t border-dashed" />
      </div>
      <CardContent className="space-y-1 pt-0">
        {players?.map((player) => (
          <PlayerItem
            key={player.id}
            player={{
              ...player,
              memberId: player.memberId ?? null,
            }}
            canModerate={canModerate}
            matchId={id}
            organizationCode={organizationCode}
          />
        ))}
      </CardContent>
    </>
  );
};
