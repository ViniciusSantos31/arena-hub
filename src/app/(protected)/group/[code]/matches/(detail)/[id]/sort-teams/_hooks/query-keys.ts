// Query Keys para página Sort Teams
export const sortTeamsQueryKeys = {
  all: ["sort-teams"] as const,
  mutations: () => [...sortTeamsQueryKeys.all, "mutation"] as const,
  sort: (matchId: string, nTeams: number) =>
    [...sortTeamsQueryKeys.mutations(), matchId, nTeams] as const,
  teams: (matchId: string) =>
    [...sortTeamsQueryKeys.all, "teams", matchId] as const,
} as const;
