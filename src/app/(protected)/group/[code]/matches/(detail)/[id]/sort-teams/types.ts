import { Player, Team } from "@/actions/team/types";

export type SortMode = "balanced" | "pots" | "random";

export interface Pot {
  id: string;
  label: string;
  color: "purple" | "teal" | "coral" | "amber";
  playerIds: string[];
}

export interface SortTeamsParams {
  matchId: string;
  organizationCode: string;
  nTeams: number;
  mode: SortMode;
  pots?: Pot[];
}

export interface SortTeamsResult {
  teams: Team[];
  reserves: Player[];
}

export interface SortTeamsState {
  nTeams: number;
  mode: SortMode;
  teams: Team[];
  reserves: Player[];
  pots: Pot[];
}
