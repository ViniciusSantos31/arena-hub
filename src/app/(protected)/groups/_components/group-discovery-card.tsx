"use client";

import { joinGroupByCode } from "@/actions/group/join";
import type { GroupUserStatus } from "@/actions/group/list-all-groups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarFallback } from "@/utils/avatar";
import {
  ArrowRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  LockIcon,
  UsersIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { toast } from "sonner";

interface GroupDiscoveryCardProps {
  group: {
    id: string;
    name: string;
    logo: string | null;
    code: string;
    private: boolean;
    maxPlayers: number;
    memberCount: number;
    userStatus: GroupUserStatus;
    inviteToken: string | null;
  };
  onRequestJoin: (group: { code: string; name: string }) => void;
}

export function GroupDiscoveryCard({
  group,
  onRequestJoin,
}: GroupDiscoveryCardProps) {
  const { execute: joinGroup, isPending: isJoining } = useAction(
    joinGroupByCode,
    {
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Não foi possível entrar no grupo");
      },
    },
  );

  const occupancyPercent = Math.round(
    (group.memberCount / group.maxPlayers) * 100,
  );

  const isFull = group.memberCount >= group.maxPlayers;

  return (
    <Card className="border-border/60 hover:border-border transition-colors">
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <Avatar className="size-16 rounded-2xl">
            {group.logo && (
              <AvatarImage
                src={group.logo}
                alt={group.name}
                className="object-cover"
              />
            )}
            <AvatarFallback className="bg-primary/10 text-primary rounded-2xl text-lg font-semibold">
              {getAvatarFallback(group.name)}
            </AvatarFallback>
          </Avatar>

          <div className="w-full min-w-0">
            <p className="truncate text-sm font-semibold">{group.name}</p>
            <div className="mt-1.5 flex items-center justify-center gap-1.5">
              {group.private ? (
                <Badge
                  variant="secondary"
                  className="gap-1 px-1.5 py-0 text-[10px]"
                >
                  <LockIcon className="h-2.5 w-2.5" />
                  Privado
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="gap-1 px-1.5 py-0 text-[10px]"
                >
                  Público
                </Badge>
              )}
              {isFull && (
                <Badge
                  variant="destructive"
                  className="px-1.5 py-0 text-[10px]"
                >
                  Lotado
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <UsersIcon className="h-3 w-3" />
              {group.memberCount}/{group.maxPlayers} membros
            </span>
            <span className="text-muted-foreground text-[10px] tabular-nums">
              {occupancyPercent}%
            </span>
          </div>
          <div className="bg-muted relative h-1.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
            />
          </div>
        </div>

        <ActionButton
          group={group}
          isFull={isFull}
          isJoining={isJoining}
          onJoin={() => joinGroup({ code: group.code })}
          onRequestJoin={onRequestJoin}
        />
      </CardContent>
    </Card>
  );
}

function ActionButton({
  group,
  isFull,
  isJoining,
  onJoin,
  onRequestJoin,
}: {
  group: GroupDiscoveryCardProps["group"];
  isFull: boolean;
  isJoining: boolean;
  onJoin: () => void;
  onRequestJoin: GroupDiscoveryCardProps["onRequestJoin"];
}) {
  if (group.userStatus === "member") {
    return (
      <Button size="sm" variant="outline" asChild className="w-full">
        <Link href={`/group/${group.code}/overview`}>
          <ArrowRightIcon className="h-3.5 w-3.5" />
          Ver grupo
        </Link>
      </Button>
    );
  }

  if (group.userStatus === "approved_invite" && group.inviteToken) {
    return (
      <Button size="sm" variant="default" asChild className="w-full gap-1.5">
        <Link href={`/invite/${group.inviteToken}`}>
          <CheckCircle2Icon className="h-3.5 w-3.5" />
          Entrar agora
        </Link>
      </Button>
    );
  }

  if (group.userStatus === "pending_request") {
    return (
      <Button size="sm" variant="secondary" disabled className="w-full gap-1.5">
        <ClockIcon className="h-3.5 w-3.5" />
        Aguardando aprovação
      </Button>
    );
  }

  if (isFull) {
    return (
      <Button size="sm" variant="outline" disabled className="w-full">
        Grupo lotado
      </Button>
    );
  }

  if (group.private) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => onRequestJoin({ code: group.code, name: group.name })}
      >
        Solicitar entrada
      </Button>
    );
  }

  return (
    <Button size="sm" className="w-full" onClick={onJoin} disabled={isJoining}>
      Entrar
    </Button>
  );
}
