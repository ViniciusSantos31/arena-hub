// Query Keys para página Feed
export const feedQueryKeys = {
  all: ["feed"] as const,
  groups: () => [...feedQueryKeys.all, "groups"] as const,
  groupsList: (filters?: unknown) =>
    [...feedQueryKeys.groups(), { filters }] as const,
  checkRequest: (organizationCode: string) =>
    [...feedQueryKeys.all, "check-request", organizationCode] as const,
} as const;
