"use client";

import { getUserMatchPlayer, joinMatch } from "@/actions/match/join";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { Status } from "@/utils/status";
import { useQuery } from "@tanstack/react-query";
import { PlayIcon, UserRoundMinusIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

export const JoinMatchButton = ({
  match,
  organizationCode,
}: {
  organizationCode: string;
  match: {
    id: string;
    status: Status;
  };
}) => {
  const { data: player } = useQuery({
    queryKey: ["player", match.id],
    enabled: !!match.id,
    queryFn: async () =>
      getUserMatchPlayer({ matchId: match.id }).then((res) => res.data),
  });

  const { sendEvent } = useWebSocket();

  const joinMatchAction = useAction(joinMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === "players" ||
            query.queryKey[0] === "player" ||
            query.queryKey[0] === "match" ||
            query.queryKey[0] === "matches"
          );
        },
      });
      if (player) {
        toast.warning("Você saiu da partida!");
        return;
      }
      toast.success("Inscrição realizada com sucesso!");
    },
    onError: () => {
      toast.error("Não foi possível realizar a inscrição na partida.");
    },
  });

  const handleJoinMatch = async () => {
    await joinMatchAction
      .executeAsync({
        matchId: match.id,
        organizationCode,
      })
      .then((res) => {
        const { data } = res;

        const action = data?.action;

        if (action === "joined") {
          sendEvent({
            event: WebSocketMessageType.MATCH_PARTICIPANT_JOINED,
            payload: {
              player: {
                id: data?.player?.id || "",
                name: data?.player?.name || "",
                image: data?.player?.image || null,
                score: data?.player?.score || 0,
              },
              matchId: match.id,
            },
          });
          return;
        }

        if (action === "left") {
          sendEvent({
            event: WebSocketMessageType.MATCH_PARTICIPANT_LEFT,
            payload: {
              playerId: data?.player.id || "",
              matchId: match.id,
            },
          });
        }
      });
  };

  if (player) {
    return (
      <Button
        className="flex-1 @md:flex-none"
        variant={"outline"}
        onClick={handleJoinMatch}
        disabled={
          match.status !== "open_registration" || joinMatchAction.isExecuting
        }
      >
        <UserRoundMinusIcon />
        <span className="hidden @md:block">Sair da Partida</span>
        <span className="@md:hidden">Sair</span>
      </Button>
    );
  }

  return (
    <Button
      disabled={
        match.status !== "open_registration" || joinMatchAction.isExecuting
      }
      className="flex-1 @md:flex-none"
      onClick={handleJoinMatch}
    >
      <PlayIcon />
      <span className="hidden @md:block">Participar da Partida</span>
      <span className="@md:hidden">Participar</span>
    </Button>
  );
};
