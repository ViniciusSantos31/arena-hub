import { getOrganizationByCode } from "@/actions/group/get-org-by-code";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import type { GroupSearchResult } from "../types";
import { joinGroupQueryKeys } from "./query-keys";

/**
 * Hook para buscar grupo por código
 */
export function useSearchGroupByCode(
  options?: Omit<
    UseMutationOptions<GroupSearchResult, Error, string>,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: joinGroupQueryKeys.mutations(),
    mutationFn: async (code: string) => {
      const result = await getOrganizationByCode({
        code: code.toUpperCase(),
      });
      return result;
    },
    ...options,
  });
}
