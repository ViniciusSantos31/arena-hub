"use client";

import { consumeInviteLink } from "@/actions/invite-links/consume";
import { Button } from "@/components/ui/button";
import { getRoleLabel } from "@/utils/role";
import {
  ActivityIcon,
  CalendarIcon,
  CheckCircle2Icon,
  SparklesIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { InviteCenteredShell } from "./_shared";

export function InviteStatusOk({
  token,
  groupName,
  groupLogo,
  membersCount,
  maxPlayers,
  lastActivity,
  invite,
}: {
  token: string;
  groupName: string;
  groupLogo: string | null;
  membersCount: number;
  maxPlayers: number;
  lastActivity: string | null;
  invite: {
    defaultRole: "guest" | "member";
    expiresAt: Date | null;
    maxUses: number | null;
    usesCount: number;
  };
}) {
  const router = useRouter();

  const consumeAction = useAction(consumeInviteLink, {
    onSuccess({ data }) {
      if (data?.organizationCode) {
        router.replace(`/group/${data.organizationCode}/members`);
      } else {
        router.replace("/home");
      }
    },
  });

  return (
    <InviteCenteredShell
      groupLogo={groupLogo}
      icon={SparklesIcon}
      iconClassName="text-primary"
      title={`Bora pro grupo "${groupName}"?`}
      description="Tá tudo certo com esse convite. Confira as informações e clica pra entrar."
      footer={
        <Button
          disabled={consumeAction.isExecuting}
          onClick={() => consumeAction.executeAsync({ token })}
          type="button"
        >
          <CheckCircle2Icon />
          {consumeAction.isExecuting ? "Entrando..." : "Entrar no grupo"}
        </Button>
      }
    >
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/40 rounded-xl p-3.5">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <UsersIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-xl font-bold">
              {membersCount}
              <span className="text-muted-foreground text-sm font-normal">
                /{maxPlayers}
              </span>
            </div>
            <div className="text-muted-foreground mt-0.5 text-xs">Membros</div>
          </div>

          <div className="bg-muted/40 rounded-xl p-3.5">
            <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            </div>
            {lastActivity ? (
              <>
                <div className="text-sm font-bold leading-tight">
                  {lastActivity}
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Última partida
                </div>
              </>
            ) : (
              <>
                <div className="text-muted-foreground text-sm font-medium">
                  Sem partidas
                </div>
                <div className="text-muted-foreground mt-0.5 text-xs">
                  Ainda não jogaram
                </div>
              </>
            )}
          </div>
        </div>

        <div className="border-primary/50 bg-muted/25 ring-border/40 shadow-primary/25 rounded-xl border px-4 py-3 shadow-sm ring-1">
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <UserCheckIcon className="h-4 w-4 shrink-0" />
            Você vai entrar como
          </div>
          <div className="text-foreground mt-1 text-sm font-semibold">
            {getRoleLabel(invite.defaultRole)}
          </div>
        </div>
      </div>
    </InviteCenteredShell>
  );
}
