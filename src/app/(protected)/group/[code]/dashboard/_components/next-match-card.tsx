import { listNextMatch } from "@/actions/match/list";
import { Card, CardContent } from "@/components/ui/card";
import { MatchCard } from "../../matches/_components/match-card";

export const NextMatchCard = async ({ code }: { code: string }) => {
  const response = await listNextMatch({ code });

  if (response.data) {
    return <MatchCard match={response.data} />;
  }

  return (
    <Card className="w-full border-dashed">
      <CardContent className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground text-center">
          Nenhuma próxima partida encontrada
        </div>
      </CardContent>
    </Card>
  );
};
