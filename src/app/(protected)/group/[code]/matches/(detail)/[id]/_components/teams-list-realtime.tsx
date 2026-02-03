"use client";

import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { useCallback, useEffect } from "react";
import { matchDetailQueryKeys } from "../_hooks";

export const TeamsListRealtime = ({
  children,
  matchId,
}: {
  children: React.ReactNode;
  matchId: string;
}) => {
  const { on, off, listenMatchEvents } = useWebSocket();

  const refetchTeamsList = useCallback(() => {
    queryClient.refetchQueries({
      queryKey: ["teams", matchId],
      predicate(query) {
        return (
          query.queryKey[0] === matchDetailQueryKeys.all[0] ||
          query.queryKey === matchDetailQueryKeys.teams(matchId)
        );
      },
    });
  }, [matchId]);

  useEffect(() => {
    on(WebSocketMessageType.MATCH_STATUS_UPDATED, (data) => {
      if (
        data &&
        "status" in data &&
        data.matchId === matchId &&
        data.status === "team_sorted"
      )
        refetchTeamsList();
    });

    return () => {
      off(WebSocketMessageType.MATCH_STATUS_UPDATED, () => {});
    };
  }, [listenMatchEvents, matchId, off, on, refetchTeamsList]);

  return <>{children}</>;
};
