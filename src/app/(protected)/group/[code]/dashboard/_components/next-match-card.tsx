import { listNextMatch } from "@/actions/match/list";
import { MatchCard } from "../../matches/_components/match-card";

export const NextMatchCard = async ({ code }: { code: string }) => {
  const response = await listNextMatch({ code });

  if (response.data) {
    return <MatchCard match={response.data} />;
  }

  return null;
};
