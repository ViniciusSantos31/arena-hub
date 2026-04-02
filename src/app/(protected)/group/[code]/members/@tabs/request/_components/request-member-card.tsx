"use client";

import { acceptJoinRequest } from "@/actions/request/accept";
import { rejectJoinRequest } from "@/actions/request/reject";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { getAvatarFallback } from "@/utils/avatar";
import { Check, X } from "lucide-react";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface RequestMemberCardProps {
  member: {
    id?: string;
    name?: string;
    email?: string;
    image?: string | null;
    requestDate?: string;
  };
  request: {
    status: string;
    id: string;
  };
  loading?: boolean;
}

export const RequestMemberCard = ({
  member,
  request,
}: RequestMemberCardProps) => {
  const { execute, optimisticState, isExecuting } = useOptimisticAction(
    acceptJoinRequest,
    {
      currentState: request,
      updateFn: (currentState) => ({
        ...currentState,
        status: "approved",
      }),
      onSuccess: () => {
        toast.success("Solicitação aceita com sucesso!", {
          id: "accept-join-request-toast",
        });
        queryClient.invalidateQueries({
          predicate(query) {
            return (
              query.queryKey[0] === "active-members" ||
              query.queryKey[0] === "list-requests"
            );
          },
        });
      },
      onError: () => {
        toast.error("Erro ao aceitar solicitação.", {
          id: "accept-join-request-error-toast",
        });
      },
    },
  );

  const {
    execute: rejectJoinRequestAction,
    optimisticState: rejectOptimisticState,
    isExecuting: isRejectExecuting,
  } = useOptimisticAction(rejectJoinRequest, {
    currentState: request,
    updateFn: (currentState) => ({
      ...currentState,
      status: "rejected",
    }),
    onSuccess: () => {
      toast.success("Solicitação recusada com sucesso!", {
        id: "reject-join-request-toast",
      });
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === "active-members" ||
            query.queryKey[0] === "list-requests"
          );
        },
      });
    },
    onError: () => {
      toast.error("Erro ao recusar solicitação.", {
        id: "reject-join-request-error-toast",
      });
    },
  });

  const canHandleRequest = useGuard({
    action: ["membership:approve"],
  });

  const handleAccept = () => {
    if (!optimisticState.id) return;
    execute({ requestId: optimisticState.id });
  };

  const handleReject = () => {
    if (!rejectOptimisticState.id) return;
    rejectJoinRequestAction({ requestId: rejectOptimisticState.id });
  };

  const StatusRequestBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="text-xs">
            Pendente
          </Badge>
        );
      case "approved":
        return <Badge className="text-xs">Aprovado</Badge>;
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            Recusado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="bg-card border-border/60 @container flex flex-col gap-3 rounded-xl border px-4 py-3 @md:flex-row @md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage src={member.image ?? undefined} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {getAvatarFallback(member.name ?? "")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-foreground truncate text-sm font-semibold">{member.name}</h3>
          <p className="text-muted-foreground truncate text-xs">{member.email}</p>
          <div className="mt-0.5">
            <StatusRequestBadge status={optimisticState.status} />
          </div>
        </div>
      </div>
      {optimisticState.status === "pending" && canHandleRequest && (
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isRejectExecuting || !request.id}
            className="h-8 text-xs"
          >
            <X className="h-3.5 w-3.5" />
            Recusar
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isExecuting || !request.id}
            className="h-8 text-xs"
          >
            <Check className="h-3.5 w-3.5" />
            Aceitar
          </Button>
        </div>
      )}
    </div>
  );
};

export const RequestMemberCardLoading = () => {
  return (
    <div className="bg-card border-border/60 flex animate-pulse items-center gap-3 rounded-xl border px-4 py-3">
      <div className="bg-muted h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="bg-muted h-4 w-32 rounded" />
        <div className="bg-muted h-3 w-48 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="bg-muted h-8 w-16 rounded" />
        <div className="bg-muted h-8 w-16 rounded" />
      </div>
    </div>
  );
};
