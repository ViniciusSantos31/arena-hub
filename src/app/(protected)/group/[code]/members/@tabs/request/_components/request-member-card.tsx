"use client";

import { acceptJoinRequest } from "@/actions/request/accept";
import { rejectJoinRequest } from "@/actions/request/reject";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="bg-muted/30 hover:bg-muted/50 transition-all duration-200 dark:border-0">
      <CardContent>
        <div className="flex flex-col justify-between @md:flex-row @md:items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.image ?? undefined} alt={member.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getAvatarFallback(member.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-foreground font-medium">{member.name}</h3>
              <p className="text-muted-foreground truncate text-sm">
                {member.email}
              </p>
              <StatusRequestBadge status={optimisticState.status} />
            </div>
          </div>
          {optimisticState.status === "pending" && canHandleRequest && (
            <div className="mt-4 ml-auto flex items-center gap-2 @md:mt-0">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleReject}
                disabled={isRejectExecuting || !request.id}
              >
                <X className="h-4 w-4" />
                Recusar
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                disabled={isExecuting || !request.id}
              >
                <Check className="h-4 w-4" />
                Aceitar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const RequestMemberCardLoading = () => {
  return (
    <Card className="bg-muted/30 animate-pulse dark:border-0">
      <CardContent>
        <div className="flex flex-col justify-between @md:flex-row @md:items-center">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-12 min-w-12 rounded-full" />
            <div className="flex flex-col space-y-1 @md:space-y-0.5">
              <div className="bg-muted h-5 w-32 rounded @md:h-5.5" />
              <div className="bg-muted h-5 w-1/2 rounded @md:w-48" />
              <div className="bg-muted h-5.5 w-28 rounded" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 @md:mt-0">
            <div className="bg-muted h-9 w-20 rounded" />
            <div className="bg-muted h-9 w-20 rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
