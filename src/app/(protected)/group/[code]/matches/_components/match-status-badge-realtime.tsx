"use client";

import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { useCallback, useEffect } from "react";

export const MatchStatusBadgeRealtime = ({
  children,
  matchId,
}: {
  children: React.ReactNode;
  matchId: string;
}) => {
  const { on, off, listenMatchEvents } = useWebSocket();

  const setMatchStatus = useCallback(() => {
    queryClient.refetchQueries({
      queryKey: ["match", matchId],
    });
  }, [matchId]);

  useEffect(() => {
    on(WebSocketMessageType.MATCH_STATUS_UPDATED, () => {
      setMatchStatus();
    });

    return () => {
      off(WebSocketMessageType.MATCH_STATUS_UPDATED, () => {});
    };
  }, [listenMatchEvents, matchId, off, on, setMatchStatus]);

  return <>{children}</>;
};
