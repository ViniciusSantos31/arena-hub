import { matchDetails } from "@/actions/match/list";
import { listMatchPlayers } from "@/actions/match/player";
import { listTeamPlayers } from "@/actions/team/list";
import {
  keepPreviousData,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query";
import type {
  MatchDetail,
  MatchPlayer,
  MatchPlayersData,
  Team,
} from "../types";
import { matchDetailQueryKeys } from "./query-keys";

/**
 * Hook para buscar detalhes da partida
 */
export function useMatchDetails(
  matchId: string,
  options?: Omit<UseQueryOptions<MatchDetail>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: matchDetailQueryKeys.match(matchId),
    enabled: !!matchId,
    queryFn: async () =>
      matchDetails({ matchId }).then((res) => res.data as MatchDetail),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/**
 * Hook para buscar jogadores da partida
 */
export function useMatchPlayers(
  matchId: string,
  options?: Omit<UseQueryOptions<MatchPlayersData>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: matchDetailQueryKeys.players(matchId),
    enabled: !!matchId,
    queryFn: async () =>
      listMatchPlayers({ matchId }).then(
        (res) => res.data || { players: [], waitingQueue: [] },
      ),
    placeholderData: keepPreviousData,
    ...options,
  });
}

/**
 * Hook para buscar fila de espera da partida
 */
export function useWaitingQueue(
  matchId: string,
  options?: Omit<UseQueryOptions<MatchPlayer[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: matchDetailQueryKeys.waitingQueue(matchId),
    enabled: !!matchId,
    queryFn: async () => {
      const data = await listMatchPlayers({ matchId }).then((res) => res.data);
      return data?.waitingQueue || [];
    },
    placeholderData: keepPreviousData,
    ...options,
  });
}

/**
 * Hook para buscar jogador específico na partida
 */
export function useMatchPlayer(
  matchId: string,
  userId?: string,
  options?: Omit<
    UseQueryOptions<{
      players: MatchPlayer[];
      waitingQueue: MatchPlayer[];
    }>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: matchDetailQueryKeys.player(matchId, userId),
    enabled: !!matchId && !!userId,
    queryFn: async () => {
      const data = await listMatchPlayers({ matchId }).then((res) => res.data);
      return data || { players: [], waitingQueue: [] };
    },
    ...options,
  });
}

/**
 * Hook para buscar times da partida
 */
export function useMatchTeams(
  matchId: string,
  options?: Omit<
    UseQueryOptions<{ teams: Team[]; reserves: MatchPlayer[] }>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: matchDetailQueryKeys.teams(matchId),
    enabled: !!matchId,
    queryFn: async () =>
      listTeamPlayers({ matchId }).then(
        (res) => res.data || { teams: [], reserves: [] },
      ),
    ...options,
  });
}
