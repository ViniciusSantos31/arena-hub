import { listAllRequests } from "@/actions/request/list";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import type { MemberRequest } from "../types";
import { memberRequestsQueryKeys } from "./query-keys";

/**
 * Hook para buscar todas as solicitações de membros de uma organização
 */
export function useMemberRequests(
  organizationCode: string,
  options?: Omit<UseQueryOptions<MemberRequest[]>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: memberRequestsQueryKeys.list(organizationCode),
    enabled: !!organizationCode,
    queryFn: async () => {
      const result = await listAllRequests({ organizationCode });
      return result.data || [];
    },
    ...options,
  });
}
