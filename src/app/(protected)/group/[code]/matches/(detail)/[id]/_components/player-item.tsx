"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { formatDate } from "@/utils/date";
import { Status } from "@/utils/status";
import {
  CheckIcon,
  LoaderIcon,
  MoreVerticalIcon,
  UserRoundIcon,
  UserRoundXIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PlayerMemberDetailsDialog } from "./player-member-details-dialog";
import { RemovePlayerDialog } from "./remove-player-dialog";

interface PlayerItemProps {
  player: {
    id?: string;
    name?: string;
    image?: string | null;
    score?: number;
    confirmed?: boolean;
    confirmedAt?: Date;
    userId?: string | null;
    memberId?: string | null;
  };
  ref?: React.Ref<HTMLDivElement>;
  canModerate?: boolean;
  matchId?: string;
  organizationCode?: string;
  matchStatus?: Status;
}

export const PlayerItem = ({
  ref,
  player,
  canModerate,
  matchId,
  organizationCode,
  matchStatus,
}: PlayerItemProps) => {
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);

  const isAbleToRemovePlayer = useMemo(() => {
    return (
      canModerate &&
      player.userId &&
      matchId &&
      organizationCode &&
      (matchStatus === "open_registration" ||
        matchStatus === "closed_registration")
    );
  }, [canModerate, player.userId, matchId, organizationCode, matchStatus]);

  return (
    <>
      <div
        key={player.id}
        className="hover:bg-muted/40 flex w-full items-center justify-between rounded-xl px-2 py-2 transition-colors"
        ref={ref}
      >
        <div className="flex items-center gap-3">
          <Avatar
            className={cn(
              "relative size-9 overflow-visible",
              player.confirmed
                ? "ring-primary ring-offset-card ring-2 ring-offset-1"
                : "ring-border ring-offset-card ring-1 ring-offset-1",
            )}
          >
            <div
              className={cn(
                "ring-card absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full ring-2",
                player.confirmed ? "bg-primary" : "bg-muted",
              )}
            >
              {player.confirmed ? (
                <CheckIcon className="size-2" />
              ) : (
                <LoaderIcon className="size-2" />
              )}
            </div>
            <AvatarFallback className="rounded-full text-xs">
              {getAvatarFallback(player.name)}
            </AvatarFallback>
            <AvatarImage
              className="rounded-full"
              src={player.image || undefined}
            />
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{player.name}</span>

            {player.score !== undefined && (
              <span className="text-muted-foreground text-xs font-medium">
                {player.score} pts
              </span>
            )}
            {player.confirmedAt && canModerate && (
              <span className="text-muted-foreground text-xs font-medium @lg:hidden">
                Confirmou em{" "}
                {formatDate(player.confirmedAt, "DD/MM/YYYY [às] HH:mm")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {player.confirmedAt && canModerate && (
            <span className="text-muted-foreground hidden text-xs font-medium @lg:block">
              Confirmou em{" "}
              {formatDate(player.confirmedAt, "DD/MM/YYYY [às] HH:mm")}
            </span>
          )}
          {canModerate && player.memberId && organizationCode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  aria-label="Ações do jogador"
                >
                  <MoreVerticalIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2"
                  onSelect={() => setMemberDetailsOpen(true)}
                >
                  <UserRoundIcon className="size-4" />
                  Ver detalhes / Punir
                </DropdownMenuItem>
                {isAbleToRemovePlayer && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive gap-2"
                      onSelect={() => setRemoveDialogOpen(true)}
                    >
                      <UserRoundXIcon className="text-destructive size-4" />
                      Remover da partida
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {canModerate && player.userId && matchId && organizationCode && (
        <RemovePlayerDialog
          open={removeDialogOpen}
          onOpenChange={setRemoveDialogOpen}
          player={{
            userId: player.userId,
            name: player.name,
            image: player.image,
          }}
          matchId={matchId}
          organizationCode={organizationCode}
        />
      )}

      {canModerate && player.memberId && organizationCode && (
        <PlayerMemberDetailsDialog
          open={memberDetailsOpen}
          onOpenChange={setMemberDetailsOpen}
          memberId={player.memberId}
          organizationCode={organizationCode}
        />
      )}
    </>
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
