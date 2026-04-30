import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { CrownIcon, MedalIcon, TrophyIcon } from "lucide-react";

type RankingItem = {
  position: number;
  id: string;
  userId: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  score: number;
  matches: number;
};

function getTopIcon(position: number) {
  if (position === 1) return CrownIcon;
  if (position === 2) return TrophyIcon;
  if (position === 3) return MedalIcon;
  return null;
}

export function GroupRankingCard({ ranking }: { ranking: RankingItem[] }) {
  return (
    <Card className="border-border/60 h-fit gap-0 overflow-hidden pb-0">
      <CardHeader className="border-b pb-4">
        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <TrophyIcon className="text-primary h-4 w-4" />
          </div>
          Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] w-full overflow-y-scroll">
        <div className="from-card sticky top-0 z-10 h-10 w-full bg-linear-to-b to-transparent" />

        {ranking.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Ainda não há membros suficientes para montar o ranking.
          </p>
        ) : (
          <ol className="space-y-2">
            {ranking.map((item) => {
              const TopIcon = getTopIcon(item.position);
              const name = item.name || item.email || "Sem nome";

              return (
                <li
                  key={item.id}
                  className="bg-card border-border/60 hover:border-primary/20 flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition-colors"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="text-muted-foreground flex w-8 items-center justify-center text-sm font-semibold tabular-nums">
                      {TopIcon ? (
                        <TopIcon className="text-primary h-4 w-4" />
                      ) : (
                        <span aria-label={`Posição ${item.position}`}>
                          {item.position}
                        </span>
                      )}
                    </div>

                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage src={item.image ?? undefined} alt={name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getAvatarFallback(name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="text-foreground truncate text-sm font-medium">
                        {name}
                      </div>
                      <div className="text-muted-foreground text-xs tabular-nums">
                        {item.matches} partidas
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-foreground text-sm font-semibold tabular-nums">
                      {item.score}
                    </div>
                    <div className="text-muted-foreground text-xs">nota</div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
        <div className="from-card sticky bottom-0 h-10 w-full bg-linear-to-t to-transparent" />
      </CardContent>
    </Card>
  );
}
