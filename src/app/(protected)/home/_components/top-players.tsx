import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { DashboardCard } from "./dashboard-card";

// 🥉 🥈 🥇

const topPlayers = [
  {
    id: 1,
    name: "João Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 9.2,
    matches: 15,
  },
  {
    id: 2,
    name: "Maria Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 8.8,
    matches: 12,
  },
  {
    id: 3,
    name: "Pedro Costa",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 8.5,
    matches: 18,
  },
];

const medals: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

export const TopPlayersCard = () => {
  return (
    <DashboardCard
      title="Top jogadores"
      description="Baseado nas notas e quantidade de partidas"
      icon={Trophy}
    >
      <div className="space-y-4">
        {topPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "bg-muted/30 flex items-center gap-3 rounded-lg p-3",
              index === 0 &&
                "animate-shadow-pulse border border-amber-300 shadow shadow-amber-200",
            )}
          >
            <div className="text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-3xl font-bold">
              {medals[index + 1]}
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={player.avatar || "/placeholder.svg"}
                alt={player.name}
              />
              <AvatarFallback>
                {player.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-foreground font-medium">{player.name}</p>
              <p className="text-muted-foreground text-sm">
                {player.matches} partidas
              </p>
            </div>
            <div className="text-right">
              <div className="text-foreground font-bold">{player.rating}</div>
              <div className="text-muted-foreground text-xs">nota média</div>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
};
