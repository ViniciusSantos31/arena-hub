import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { CheckIcon, LoaderIcon } from "lucide-react";

interface PlayerItemProps {
  player: {
    id?: string;
    name?: string;
    image?: string | null;
    score?: number;
    confirmed?: boolean;
  };
  ref?: React.Ref<HTMLDivElement>;
}

export const PlayerItem = ({ ref, player }: PlayerItemProps) => {
  return (
    <div
      key={player.id}
      className="flex items-center justify-between"
      ref={ref}
    >
      <div className="flex items-center gap-3">
        <Avatar
          className={cn(
            "relative size-10 overflow-visible",
            player.confirmed
              ? "ring-primary ring-offset-card ring-2 ring-offset-2"
              : "ring-muted-foreground/10 ring-offset-card ring-2 ring-offset-2",
          )}
        >
          <div
            className={cn(
              "ring-card absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full ring-2",
              player.confirmed ? "bg-primary" : "bg-muted",
            )}
          >
            {player.confirmed ? (
              <CheckIcon className="size-3" />
            ) : (
              <LoaderIcon className="size-3" />
            )}
          </div>
          <AvatarFallback className="rounded-full">
            {getAvatarFallback(player.name)}
          </AvatarFallback>
          <AvatarImage
            className="rounded-full"
            src={player.image || undefined}
          />
        </Avatar>
        <span>{player.name}</span>
      </div>
      {player.score !== undefined && (
        <span className="text-muted-foreground text-sm font-medium">
          {player.score} pts
        </span>
      )}
    </div>
  );
};

export const PlayerCardLoading = () => {
  return (
    <Card className="bg-muted/30 animate-pulse dark:border-0">
      <CardContent>
        <div className="flex flex-col justify-between @md:flex-row @md:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-12 min-w-12 rounded-full" />
            <div className="flex flex-col space-y-1 @md:space-y-0.5">
              <div className="bg-muted h-5 w-32 rounded @md:h-5.5" />
              <div className="bg-muted h-5 w-1/2 rounded @md:w-48" />
              <div className="bg-muted h-5.5 w-20 rounded" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 @md:mt-0">
            <div>
              <div className="bg-muted h-4 w-8 rounded" />
              <div className="bg-muted mt-1 h-3.5 w-16 rounded" />
            </div>
            <div>
              <div className="bg-muted h-4 w-8 rounded" />
              <div className="bg-muted mt-1 h-3 w-16 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
