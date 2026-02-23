"use client";

import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { useCallback, useEffect } from "react";
import { matchDetailQueryKeys } from "../_hooks";

export const PlayerListRealtime = ({
  children,
  matchId,
}: {
  children: React.ReactNode;
  matchId: string;
}) => {
  const { on, off } = useWebSocket();

  const refetchPlayersList = useCallback(() => {
    queryClient.invalidateQueries({
      predicate(query) {
        return (
          query.queryKey.includes(matchDetailQueryKeys.players(matchId)) ||
          query.queryKey.includes(matchDetailQueryKeys.waitingQueue(matchId)) ||
          query.queryKey.includes(matchId)
        );
      },
    });
  }, [matchId]);

  useEffect(() => {
    on(WebSocketMessageType.MATCH_PARTICIPANT_JOINED, () => {
      refetchPlayersList();
    });
    on(WebSocketMessageType.MATCH_PARTICIPANT_LEFT, () => {
      refetchPlayersList();
    });

    return () => {
      off(WebSocketMessageType.MATCH_PARTICIPANT_JOINED, () => {});
      off(WebSocketMessageType.MATCH_PARTICIPANT_LEFT, () => {});
    };
  }, [matchId, off, on, refetchPlayersList]);

  return <>{children}</>;
};
