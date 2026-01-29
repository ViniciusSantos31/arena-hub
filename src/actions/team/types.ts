export type Player = {
  id: string;
  name?: string;
  image?: string | null;
  score: number;
  confirmed?: boolean;
};

export type Team = {
  team: number;
  players: Array<Player>;
  score: number;
};
