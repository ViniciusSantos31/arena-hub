import { sortTeams } from "@/actions/team/sort";
import { queryClient } from "@/lib/react-query";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
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
      return result.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", variables.matchId],
      });
    },
    ...options,
  });
}
