// Query Keys para página Join Group
export const joinGroupQueryKeys = {
  all: ["join-group"] as const,
  mutations: () => [...joinGroupQueryKeys.all, "mutation"] as const,
  findGroup: (code: string) =>
    [...joinGroupQueryKeys.all, "find", code] as const,
} as const;
