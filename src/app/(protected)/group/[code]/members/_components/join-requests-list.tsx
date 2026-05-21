"use client";

import { reviewJoinRequest } from "@/actions/group/review-join-request";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getAvatarFallback } from "@/utils/avatar";
import { CheckIcon, InboxIcon, MessageSquareIcon, XIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type JoinRequest = {
  id: string;
  message: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

interface JoinRequestsListProps {
  requests: JoinRequest[];
  organizationCode: string;
}

function JoinRequestCard({
  request,
  onReview,
  processingId,
}: {
  request: JoinRequest;
  onReview: (requestId: string, action: "approve" | "reject") => void;
  processingId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const isProcessing = processingId === request.id;

  const date = new Date(request.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="bg-muted/30 dark:border-0">
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage
                  src={request.user.image ?? undefined}
                  alt={request.user.name}
                />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getAvatarFallback(request.user.name ?? "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-foreground text-sm font-medium">
                  {request.user.name}
                </h3>
                <p className="text-muted-foreground truncate text-xs">
                  {request.user.email}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">{date}</p>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs">
              Pendente
            </Badge>
          </div>

          {request.message && (
            <div className="bg-background rounded-lg border p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <MessageSquareIcon className="text-muted-foreground h-3.5 w-3.5" />
                <span className="text-muted-foreground text-xs font-medium">
                  Mensagem de apresentação
                </span>
              </div>
              <p
                className={`text-sm leading-relaxed ${!expanded && request.message.length > 150 ? "line-clamp-3" : ""}`}
              >
                {request.message}
              </p>
              {request.message.length > 150 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-primary mt-1 text-xs hover:underline"
                >
                  {expanded ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReview(request.id, "reject")}
              disabled={isProcessing}
            >
              <XIcon className="h-4 w-4" />
              Recusar
            </Button>
            <Button
              size="sm"
              onClick={() => onReview(request.id, "approve")}
              disabled={isProcessing}
            >
              <CheckIcon className="h-4 w-4" />
              Aprovar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function JoinRequestsList({
  requests: initialRequests,
  organizationCode,
}: JoinRequestsListProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { execute } = useAction(reviewJoinRequest, {
    onSuccess: ({ data, input }) => {
      const action = data?.action;
      if (action === "approved") {
        toast.success("Solicitação aprovada. Link de convite enviado!");
      } else {
        toast.success("Solicitação recusada.");
      }
      setRequests((prev) => prev.filter((r) => r.id !== input.requestId));
      setProcessingId(null);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao processar solicitação");
      setProcessingId(null);
    },
  });

  const handleReview = (requestId: string, action: "approve" | "reject") => {
    setProcessingId(requestId);
    execute({ requestId, action });
  };

  if (requests.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon className="text-primary h-5 w-5" />
          </EmptyMedia>
          <EmptyTitle>Sem solicitações pendentes</EmptyTitle>
          <EmptyDescription>
            Quando alguém solicitar entrar no grupo, aparecerá aqui.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-muted-foreground text-xs">
        {requests.length}{" "}
        {requests.length === 1
          ? "solicitação pendente"
          : "solicitações pendentes"}
      </p>
      {requests.map((request) => (
        <JoinRequestCard
          key={request.id}
          request={request}
          onReview={handleReview}
          processingId={processingId}
        />
      ))}
    </div>
  );
}
