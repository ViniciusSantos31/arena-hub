import { listNextMatch } from "@/actions/match/list";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "../../matches/_components/match-card";

export const NextMatchCard = async ({ code }: { code: string }) => {
  const response = await listNextMatch({ code });

  if (!response.data) {
    return null;
  }

  return (
    <div className="relative col-span-full">
      <Badge className="bg-primary text-primary-foreground absolute top-0 left-0 rounded-bl-none shadow-2xl">
        Próxima partida
      </Badge>
      <MatchCard match={response.data} />
    </div>
  );
};
