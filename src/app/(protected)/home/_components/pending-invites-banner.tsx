"use client";

import { declineDirectInvite } from "@/actions/invite-links/decline-direct-invite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getAvatarFallback } from "@/utils/avatar";
import {
  CalendarIcon,
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
  sentBy: string;
  invitePath: string | null;
  isLinkValid: boolean;
  organization: {
    name: string;
    logo: string | null;
    maxPlayers: number;
    membersCount: number;
    lastActivity: string | null;
  };
}

export function PendingInvitesBanner({
  invites,
}: {
  invites: PendingInvite[];
}) {
  const router = useRouter();
  const [declining, setDeclining] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = invites.filter((i) => !dismissed.has(i.id));

  if (visible.length === 0) return null;

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

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1.5 text-sm font-medium">
        <SendIcon className="text-primary size-4" />
        Convites pendentes
        <span className="bg-primary text-primary-foreground flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
          {visible.length}
        </span>
      </h2>

      <div className="flex flex-col gap-2">
        {visible.map((invite) => (
          <div
            key={invite.id}
            className="border-border/60 bg-card flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-10 w-10 shrink-0 rounded-xl">
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
                <p className="truncate font-semibold">
                  {invite.organization.name}
                </p>
                <div className="text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
                  <span className="flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" />
                    {invite.organization.membersCount}/
                    {invite.organization.maxPlayers}
                  </span>
                  {invite.organization.lastActivity && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {invite.organization.lastActivity}
                    </span>
                  )}
                  <span>
                    Por <span className="font-medium">{invite.sentBy}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 gap-2">
              {invite.isLinkValid && invite.invitePath ? (
                <Button asChild size="sm" className="h-8 flex-1 gap-1.5 text-xs sm:flex-none">
                  <Link href={invite.invitePath}>
                    <CheckCircle2Icon className="h-3.5 w-3.5" />
                    Aceitar
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 flex-1 text-xs sm:flex-none"
                  disabled
                >
                  Link expirado
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
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
    </section>
  );
}
