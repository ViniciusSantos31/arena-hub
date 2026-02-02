import { sortTeams } from "@/actions/team/sort";
import { queryClient } from "@/lib/react-query";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { matchDetailQueryKeys } from "../../_hooks";
import type { SortTeamsParams, SortTeamsResult } from "../types";
import { sortTeamsQueryKeys } from "./query-keys";

/**
 * Hook para sortear times
 */
export function useSortTeams(
  options?: Omit<
    UseMutationOptions<SortTeamsResult, Error, SortTeamsParams>,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: sortTeamsQueryKeys.mutations(),
    mutationFn: async ({
      matchId,
      organizationCode,
      nTeams,
    }: SortTeamsParams) => {
      const result = await sortTeams({ matchId, organizationCode, nTeams });
      return result.data as SortTeamsResult;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchDetailQueryKeys.teams(variables.matchId),
        predicate(query) {
          return query.queryKey[0] === matchDetailQueryKeys.all[0];
        },
      });
    },
    ...options,
  });
}
