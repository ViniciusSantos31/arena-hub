"use client";

import { declineDirectInvite } from "@/actions/invite-links/decline-direct-invite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAvatarFallback } from "@/utils/avatar";
import {
  ActivityIcon,
  CheckCircle2Icon,
  SendIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface PendingInvite {
  id: string;
  createdAt: string;
  sentBy: string;
  invitePath: string | null;
  isLinkValid: boolean;
  organization: {
    id: string;
    name: string;
    logo: string | null;
    code: string;
    maxPlayers: number;
    membersCount: number;
    lastActivity: string | null;
  };
}

export function PendingInvitesList({ invites }: { invites: PendingInvite[] }) {
  const router = useRouter();
  const [declining, setDeclining] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = invites.filter((i) => !dismissed.has(i.id));

  async function handleDecline(inviteId: string) {
    setDeclining(inviteId);
    try {
      await declineDirectInvite({ inviteId });
      setDismissed((prev) => new Set([...prev, inviteId]));
      toast.success("Convite recusado.");
      router.refresh();
    } catch {
      toast.error("Erro ao recusar convite.");
    } finally {
      setDeclining(null);
    }
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
          <SendIcon className="text-muted-foreground h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Nenhum convite pendente</p>
          <p className="text-muted-foreground text-xs">
            Quando um admin te convidar para um grupo, ele aparecerá aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map((invite) => (
        <div key={invite.id} className="space-y-3 rounded-xl border p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-11 w-11 shrink-0 rounded-xl">
              {invite.organization.logo && (
                <AvatarImage
                  src={invite.organization.logo}
                  alt={invite.organization.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-sm font-semibold">
                {getAvatarFallback(invite.organization.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="font-semibold">{invite.organization.name}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Convite enviado por{" "}
                <span className="font-medium">{invite.sentBy}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted/40 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5">
                <UsersIcon className="text-primary h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {invite.organization.membersCount}/
                  {invite.organization.maxPlayers} membros
                </span>
              </div>
            </div>
            <div className="bg-muted/40 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5">
                <ActivityIcon className="text-primary h-3.5 w-3.5" />
                <span className="truncate text-xs font-medium">
                  {invite.organization.lastActivity ?? "Sem partidas"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            {invite.isLinkValid && invite.invitePath ? (
              <Button asChild size="sm" className="h-8">
                <Link href={invite.invitePath}>
                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                  Aceitar
                </Link>
              </Button>
            ) : (
              <Button size="sm" className="flex" variant="secondary" disabled>
                Link expirado
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={declining === invite.id}
              onClick={() => handleDecline(invite.id)}
            >
              <XIcon className="h-3.5 w-3.5" />
              Recusar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
