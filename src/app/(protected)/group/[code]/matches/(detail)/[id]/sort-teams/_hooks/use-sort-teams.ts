import { sortTeams, sortTeamsByPots } from "@/actions/team/sort";
import { queryClient } from "@/lib/react-query";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { matchDetailQueryKeys } from "../../_hooks";
import type { SortTeamsParams, SortTeamsResult } from "../types";
import { sortTeamsQueryKeys } from "./query-keys";

export function useSortTeams(
  options?: Omit<
    UseMutationOptions<SortTeamsResult, Error, SortTeamsParams>,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: sortTeamsQueryKeys.mutations(),
    mutationFn: async ({ matchId, organizationCode, nTeams, mode, pots }) => {
      if (mode === "pots" && pots) {
        const result = await sortTeamsByPots({
          matchId,
          organizationCode,
          nTeams,
          pots,
        });
        return result.data as SortTeamsResult;
      }
      // balanced e random usam a action existente
      const result = await sortTeams({ matchId, organizationCode, nTeams });
      return result.data as SortTeamsResult;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchDetailQueryKeys.teams(variables.matchId),
      });
    },
    ...options,
  });
}
