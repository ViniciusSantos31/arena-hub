import { Status } from "@/utils/status";

export interface MatchDetail {
  id: string;
  title: string;
  date: Date;
  sport: string;
  category: string;
  location: string;
  minPlayers: number;
  maxPlayers: number;
  status: Status;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  isPaid: boolean;
  price: number | null;
}

export interface MatchPlayer {
  id: string;
  name?: string;
  image?: string | null;
  userId?: string | null;
  memberId?: string | null;
  score: number;
  confirmed: boolean;
  waitingQueue?: boolean;
  paymentStatus?: "pending" | "paid" | "refunded" | "exempt";
}

export interface MatchPlayersData {
  players: MatchPlayer[];
  waitingQueue: MatchPlayer[];
}

export interface Team {
  team: number;
  score: number;
  players: MatchPlayer[];
}
