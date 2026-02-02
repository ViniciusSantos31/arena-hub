import { Player, Team } from "@/actions/team/types";

export interface SortTeamsParams {
  matchId: string;
  organizationCode: string;
  nTeams: number;
}

export interface SortTeamsResult {
  teams: Team[];
  reserves: Player[];
}

export interface SortTeamsState {
  nTeams: number;
  teams: Team[];
  reserves: Player[];
}
