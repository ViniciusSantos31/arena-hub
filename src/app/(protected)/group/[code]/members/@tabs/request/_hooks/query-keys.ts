// Query Keys para página de Requests dos Membros
export const memberRequestsQueryKeys = {
  all: ["member-requests"] as const,
  lists: () => [...memberRequestsQueryKeys.all, "list"] as const,
  list: (organizationCode: string) =>
    [...memberRequestsQueryKeys.lists(), organizationCode] as const,
} as const;
