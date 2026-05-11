"use client";

import type { AdminGroupListItem } from "@/actions/admin/groups/list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAvatarFallback } from "@/utils/avatar";
import { ClockIcon, LockIcon, UsersRoundIcon } from "lucide-react";
import Link from "next/link";
import { GroupOwnerChip } from "./group-owner-chip";

function formatDateTimePtBr(dateIso: string) {
  return new Date(dateIso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GroupAdminCard({ group }: { group: AdminGroupListItem }) {
  const occupancyText = `${group.memberCount}/${group.maxPlayers}`;
  const occupancyPercent =
    group.maxPlayers > 0
      ? Math.min(100, (group.memberCount * 100) / group.maxPlayers)
      : 0;

  return (
    <Card className="border-border/60 overflow-hidden">
      <Link
        href={`/admin/groups/${group.code}`}
        className={cn(
          "group/card block space-y-6 transition-colors",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        )}
      >
        <CardHeader className="gap-3">
          <div className="flex items-start gap-3">
            <Avatar className="size-11 rounded-xl">
              <AvatarImage
                src={group.logo ?? undefined}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                {getAvatarFallback(group.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="truncate text-base leading-snug">
                  {group.name}
                </CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {group.code}
                </Badge>
              </div>

              <CardDescription className="mt-1 flex items-center gap-2 text-xs">
                <LockIcon className="h-3.5 w-3.5 text-yellow-600" />
                Privado
              </CardDescription>
            </div>
          </div>

          <div className="mt-1 grid grid-cols-2 gap-3">
            <div className="border-border/60 bg-background/50 rounded-md border p-3">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <UsersRoundIcon className="h-3.5 w-3.5" />
                Lotação
              </div>
              <div className="mt-1 flex items-end justify-between gap-2">
                <div className="text-sm font-semibold">{occupancyText}</div>
                <div className="text-muted-foreground text-xs">
                  {Math.round(occupancyPercent)}%
                </div>
              </div>
              <div className="bg-muted mt-2 h-1.5 w-full rounded-full">
                <div
                  className="bg-primary h-1.5 rounded-full transition-[width]"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>

            <div className="border-border/60 bg-background/50 rounded-md border p-3">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <ClockIcon className="h-3.5 w-3.5" />
                Última atividade
              </div>
              <div className="mt-1 text-sm font-semibold">
                {formatDateTimePtBr(group.lastActivityAt)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <GroupOwnerChip owner={group.owner} />
        </CardContent>

        <CardFooter className="pt-0">
          <span className="text-primary text-sm font-medium underline-offset-4 group-hover/card:underline">
            Ver detalhes
          </span>
        </CardFooter>
      </Link>
    </Card>
  );
}
