// Query Keys para página Match Detail
export const matchDetailQueryKeys = {
  all: ["match-detail"] as const,
  match: (matchId: string) =>
    [...matchDetailQueryKeys.all, "match", matchId] as const,
  players: (matchId: string) =>
    [...matchDetailQueryKeys.all, "players", matchId] as const,
  waitingQueue: (matchId: string) =>
    [...matchDetailQueryKeys.all, "waiting-queue", matchId] as const,
  teams: (matchId: string) =>
    [...matchDetailQueryKeys.all, "teams", matchId] as const,
  player: (matchId: string, userId?: string) =>
    [...matchDetailQueryKeys.all, "player", matchId, userId] as const,
} as const;
