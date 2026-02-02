import { listAllGroups } from "@/actions/group/list-all-groups";
import { alreadyRequest } from "@/actions/request/already-request";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { FeedGroup } from "../types";
import { feedQueryKeys } from "./query-keys";

/**
 * Hook para buscar todos os grupos para o feed
 */
export function useFeedGroups(
  options?: Omit<UseQueryOptions<FeedGroup[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: feedQueryKeys.groups(),
    queryFn: async () => {
      const result = await listAllGroups();
      return result.data || [];
    },
    ...options,
  });
}

/**
 * Hook para verificar se o usuário já solicitou entrada em um grupo privado
 */
export function useCheckAlreadyRequested(
  organizationCode: string,
  isPrivate: boolean,
  options?: Omit<UseQueryOptions<boolean>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: feedQueryKeys.checkRequest(organizationCode),
    enabled: isPrivate && !!organizationCode,
    queryFn: async () => {
      const result = await alreadyRequest({ organizationCode });
      return Boolean(result.data);
    },
    ...options,
  });
}
