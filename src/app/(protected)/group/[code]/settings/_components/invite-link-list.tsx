import { deleteInviteLink } from "@/actions/invite-links/delete";
import { listInviteLinks } from "@/actions/invite-links/list";
import { revokeInviteLink } from "@/actions/invite-links/revoke";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/react-query";
import { formatDate } from "@/utils/date";
import { getRoleLabel } from "@/utils/role";
import { IconClockX } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CopyIcon, LinkIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { inviteLinksQueryKeys } from "../_hooks/query-keys";

function buildInviteUrl(inviteUrl: string | null, invitePath: string) {
  if (inviteUrl) return inviteUrl;
  if (typeof window === "undefined") return invitePath;
  return `${window.location.origin}${invitePath}`;
}

function formatUses(usesCount: number, maxUses: number | null) {
  if (!maxUses) return `${usesCount} uso(s)`;
  return `${usesCount}/${maxUses} uso(s)`;
}

export const InviteLinkList = () => {
  const { code } = useParams<{ code: string }>();
  const listAction = useAction(listInviteLinks, {
    onError() {
      toast.error("Não foi possível carregar os links de convite.");
    },
  });

  const revokeAction = useAction(revokeInviteLink, {
    onSuccess() {
      toast.success("Link revogado.");
      queryClient.invalidateQueries({
        queryKey: inviteLinksQueryKeys.list(code),
      });
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Não foi possível revogar o link.");
    },
  });

  const deleteInviteLinkAction = useAction(deleteInviteLink, {
    onSuccess() {
      toast.success("Link deletado.");
      queryClient.invalidateQueries({
        queryKey: inviteLinksQueryKeys.list(code),
      });
    },
    onError({ error }) {
      toast.error(
        error.thrownError?.message || "Não foi possível deletar o link.",
      );
    },
  });

  const { data: links, isLoading } = useQuery({
    queryKey: inviteLinksQueryKeys.list(code),
    queryFn: () =>
      listAction
        .executeAsync({ organizationCode: code })
        .then((res) => res.data?.links ?? []),
    placeholderData: keepPreviousData,
  });

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  };

  const handleRevoke = async (id: string) => {
    await revokeAction.executeAsync({
      organizationCode: code,
      inviteLinkId: id,
    });
  };

  const handleDeleteInviteLink = async (id: string) => {
    await deleteInviteLinkAction.executeAsync({
      organizationCode: code,
      inviteLinkId: id,
    });
  };

  if (!links || isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (links?.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LinkIcon />
          </EmptyMedia>
          <EmptyTitle>Nenhum link criado ainda</EmptyTitle>
          <EmptyDescription>
            Crie um novo link de convite para compartilhar com seus amigos.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-2">
      {links.map((l) => {
        const linkStatusLabels = {
          revoked: "Revogado",
          expired: "Expirado",
          "max-uses-reached": "Limite atingido",
          active: "Ativo",
        };

        return (
          <div
            key={l.id}
            className="border-border/60 flex min-h-16 flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">
                  {l.label || "Link sem nome"}
                </div>
                <span className="bg-muted text-foreground rounded-full px-2 py-0.5 text-xs">
                  {linkStatusLabels[l.status]}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 flex space-x-1 text-xs">
                <p>{`${getRoleLabel(l.defaultRole)} •`}</p>
                <p>{`${formatUses(l.usesCount, l.maxUses)} •`}</p>
                <p>
                  {l.expiresAt
                    ? `Expira em ${formatDate(l.expiresAt)}`
                    : "Não expira"}
                </p>
              </div>
              {l.revokedReason ? (
                <div className="text-muted-foreground mt-1 text-xs">
                  Motivo: {l.revokedReason}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 sm:shrink-0">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={l.status === "revoked"}
                onClick={() =>
                  handleCopy(buildInviteUrl(l.inviteUrl, l.invitePath))
                }
              >
                <CopyIcon />
                Copiar
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={l.status === "revoked" || revokeAction.isExecuting}
                onClick={() => handleRevoke(l.id)}
              >
                <IconClockX />
                Revogar
              </Button>
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={() => handleDeleteInviteLink(l.id)}
              >
                <TrashIcon />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
