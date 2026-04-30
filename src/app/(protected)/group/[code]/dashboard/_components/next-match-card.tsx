import { listNextMatch } from "@/actions/match/list";
import { MatchCard } from "../../matches/_components/match-card";

export const NextMatchCard = async ({ code }: { code: string }) => {
  const response = await listNextMatch({ code });

  if (!response.data) {
    return null;
  }

  return (
    <div className="col-span-full">
      <MatchCard match={response.data} />
    </div>
  );
};
