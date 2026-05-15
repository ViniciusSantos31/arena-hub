"use client";

import { sendDirectInvite } from "@/actions/invite-links/send-direct-invite";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAvatarFallback } from "@/utils/avatar";
import { getRoleLabel, Role } from "@/utils/role";
import { CheckIcon, LoaderIcon, SendIcon, UsersIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminGroup {
  id: string;
  name: string;
  code: string;
  logo?: string | null;
  role: string;
}

interface InviteToGroupSectionProps {
  targetUserId: string;
  adminGroups: AdminGroup[];
}

export function InviteToGroupSection({
  targetUserId,
  adminGroups,
}: InviteToGroupSectionProps) {
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [sentCodes, setSentCodes] = useState<Set<string>>(new Set());

  if (adminGroups.length === 0)
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <SendIcon className="text-muted-foreground h-4 w-4" />
          <h3 className="text-sm font-medium">Convidar para um grupo</h3>
        </div>
        <Empty className="border border-dashed">
          <EmptyContent>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon className="text-muted-foreground h-4 w-4" />
              </EmptyMedia>
              <EmptyTitle>Nenhum grupo para convidar</EmptyTitle>
              <EmptyDescription>
                Não foram encontrados grupos para convidar este jogador.
              </EmptyDescription>
            </EmptyHeader>
          </EmptyContent>
        </Empty>
      </div>
    );

  async function handleInvite(group: AdminGroup) {
    if (sentCodes.has(group.code)) return;

    setLoadingCode(group.code);
    try {
      const result = await sendDirectInvite({
        organizationCode: group.code,
        targetUserId,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      setSentCodes((prev) => new Set([...prev, group.code]));
      toast.success(`Convite enviado para ${group.name}!`);
    } catch {
      toast.error("Erro ao enviar convite. Tente novamente.");
    } finally {
      setLoadingCode(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SendIcon className="text-muted-foreground h-4 w-4" />
        <h3 className="text-sm font-medium">Convidar para um grupo</h3>
      </div>

      <div className="space-y-2">
        {adminGroups.map((group) => {
          const isLoading = loadingCode === group.code;
          const isSent = sentCodes.has(group.code);

          return (
            <div
              key={group.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <Avatar className="h-9 w-9 shrink-0 rounded-lg">
                {group.logo && (
                  <AvatarImage
                    src={group.logo}
                    alt={group.name}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary rounded-lg text-sm font-semibold">
                  {getAvatarFallback(group.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{group.name}</p>
                <p className="text-muted-foreground text-xs capitalize">
                  {getRoleLabel(group.role as Role)}
                </p>
              </div>

              <Button
                size="sm"
                variant={isSent ? "secondary" : "default"}
                className="h-8 shrink-0 gap-1.5 text-xs"
                disabled={isLoading || isSent}
                onClick={() => handleInvite(group)}
              >
                {isLoading ? (
                  <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
                ) : isSent ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" />
                    Enviado
                  </>
                ) : (
                  <>
                    <SendIcon className="h-3.5 w-3.5" />
                    Convidar
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-muted-foreground text-xs">
        O jogador receberá o convite no perfil e poderá aceitar ou recusar.
      </p>
    </div>
  );
}
