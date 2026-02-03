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
  const { on, off, listenMatchEvents } = useWebSocket();

  const refetchPlayersList = useCallback(() => {
    queryClient.refetchQueries({
      predicate(query) {
        return (
          query.queryKey[-1] === matchId &&
          query.queryKey[0] === matchDetailQueryKeys.all[0]
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
  }, [listenMatchEvents, matchId, off, on, refetchPlayersList]);

  return <>{children}</>;
};
