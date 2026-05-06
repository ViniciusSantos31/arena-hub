import { DashboardRankingOutput } from "@/actions/dashboard/ranking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { CrownIcon, MedalIcon, TrophyIcon } from "lucide-react";

function getTopIcon(position: number) {
  if (position === 1) return CrownIcon;
  if (position === 2) return TrophyIcon;
  if (position === 3) return MedalIcon;
  return null;
}

export function GroupRankingCard(props: DashboardRankingOutput) {
  const { ranking, outOfRanking, me } = props;
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
                        <TopIcon
                          className={cn(
                            "text-primary h-4 w-4",
                            item.position === 1 && "text-gold",
                            item.position === 2 && "text-silver",
                            item.position === 3 && "text-bronze",
                          )}
                        />
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
            {outOfRanking && me && (
              <>
                <div className="text-muted-foreground text-center text-xs">
                  ...
                </div>
                <li
                  key={me.id}
                  className="bg-card border-primary/60 dark:shadow-primary/20 sticky bottom-8 z-10 flex items-center justify-between gap-3 overflow-clip rounded-xl border px-3 py-2 shadow-2xl transition-colors dark:shadow-xl"
                >
                  <div className="z-10 flex min-w-0 items-center gap-2">
                    <div className="text-muted-foreground flex w-8 items-center justify-center text-sm font-semibold tabular-nums">
                      <span aria-label={`Posição ${me.position}`}>
                        {me.position}
                      </span>
                    </div>

                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarImage
                        src={me.image ?? undefined}
                        alt={me.name ?? ""}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {getAvatarFallback(me.name ?? "")}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="text-foreground truncate text-sm font-medium">
                        Você
                      </div>
                      <div className="text-muted-foreground text-xs tabular-nums">
                        {me.matches} partidas
                      </div>
                    </div>
                  </div>

                  <div className="z-10 text-right">
                    <div className="text-foreground text-sm font-semibold tabular-nums">
                      {me.score}
                    </div>
                    <div className="text-muted-foreground text-xs">nota</div>
                  </div>
                  <div className="bg-primary/10 absolute top-0 left-0 h-full w-full" />
                </li>
              </>
            )}
          </ol>
        )}
        <div className="from-card sticky bottom-0 h-10 w-full bg-linear-to-t to-transparent" />
      </CardContent>
    </Card>
  );
}
