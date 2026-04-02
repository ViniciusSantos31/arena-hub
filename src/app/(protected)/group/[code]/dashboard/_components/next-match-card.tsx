import { listNextMatch } from "@/actions/match/list";
import { Card, CardContent } from "@/components/ui/card";
import { MatchCard } from "../../matches/_components/match-card";

export const NextMatchCard = async ({ code }: { code: string }) => {
  const response = await listNextMatch({ code });

  if (response.data) {
    return <MatchCard match={response.data} />;
  }

  return (
    <Card className="border-border/60 w-full border-dashed">
      <CardContent className="flex h-48 items-center justify-center">
        <div className="text-muted-foreground text-center text-sm">
          Nenhuma partida agendada
        </div>
      </CardContent>
    </Card>
  );
};
