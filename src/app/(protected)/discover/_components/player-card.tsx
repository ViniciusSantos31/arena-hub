import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import { MapPinIcon, SwordsIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    image?: string | null;
    bio?: string | null;
    location?: string | null;
    matchesCount: number;
    groupsCount: number;
    commonGroupsCount: number;
  };
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/profile/${player.id}`} className="group outline-none">
      <Card className="border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-colors">
        <div className="flex items-start gap-3 px-4">
          <Avatar className="size-11 shrink-0 rounded-xl">
            {player.image && (
              <AvatarImage
                src={player.image}
                alt={player.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm font-semibold">
              {getAvatarFallback(player.name)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{player.name}</p>
              {player.commonGroupsCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary hover:bg-primary/15 shrink-0 gap-1 px-1.5 py-0 text-[10px] font-medium"
                >
                  <UsersIcon className="h-2.5 w-2.5" />
                  {player.commonGroupsCount}{" "}
                  {player.commonGroupsCount === 1 ? "grupo" : "grupos"} em comum
                </Badge>
              )}
            </div>

            {player.location && (
              <p className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                <MapPinIcon className="h-3 w-3 shrink-0" />
                {player.location}
              </p>
            )}

            {player.bio && (
              <p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs leading-relaxed">
                {player.bio}
              </p>
            )}

            <div className="mt-2.5 flex items-center gap-3">
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <SwordsIcon className="h-3 w-3" />
                {player.matchesCount} partidas
              </span>
              <span className="bg-border h-1 w-1 rounded-full" />
              <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <UsersIcon className="h-3 w-3" />
                {player.groupsCount} grupos
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
