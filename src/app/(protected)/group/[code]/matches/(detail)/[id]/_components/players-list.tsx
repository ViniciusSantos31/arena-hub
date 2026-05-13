import { CardContent } from "@/components/ui/card";
import { useGuard } from "@/hooks/use-guard";
import { useMatchPlayers } from "../_hooks";
import { useMatch } from "../_hooks/useMatch";
import { PlayerEmptyList } from "./player-empty-list";
import { PlayerItem } from "./player-item";

interface PlayersListProps {
  id: string;
  organizationCode: string;
}

export const PlayersList = ({ id, organizationCode }: PlayersListProps) => {
  const { data: players, isLoading } = useMatchPlayers(id);
  const { data: match } = useMatch();
  const canModerate = useGuard({ action: ["match:update"] });

  if (isLoading) {
    return (
      <CardContent className="space-y-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-muted h-11 w-full animate-pulse rounded-xl"
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
    <CardContent className="space-y-1">
      {players?.players.map((player) => (
        <PlayerItem
          key={player.id}
          player={{
            ...player,
            memberId: player.memberId ?? null,
          }}
          canModerate={canModerate}
          matchId={id}
          organizationCode={organizationCode}
          matchStatus={match?.status}
        />
      ))}
    </CardContent>
  );
};
