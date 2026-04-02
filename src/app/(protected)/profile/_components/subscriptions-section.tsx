"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/payments";
import { CalendarIcon, CreditCardIcon, XCircleIcon } from "lucide-react";

type SubscriptionStatus = "active" | "trialing" | "past_due" | "cancelled";

interface Subscription {
  id: string;
  groupName: string;
  groupCode: string;
  amountCents: number | null;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  organizationId: string;
}

interface SubscriptionsSectionProps {
  subscriptions: Subscription[];
}

const statusConfig: Record<
  SubscriptionStatus,
  { label: string; className: string }
> = {
  active: {
    label: "Ativa",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  trialing: {
    label: "Em avaliação",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  past_due: {
    label: "Pagamento pendente",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

export function SubscriptionsSection({
  subscriptions,
}: SubscriptionsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <CreditCardIcon className="text-muted-foreground h-4 w-4" />
        <h3 className="text-sm font-medium">Minhas assinaturas</h3>
      </div>

      {subscriptions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Você não possui nenhuma assinatura ativa.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((sub) => {
            const status = statusConfig[sub.status];
            return (
              <div
                key={sub.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-9 w-9 shrink-0 rounded-lg">
                  <AvatarFallback className="rounded-lg text-sm font-semibold">
                    {sub.groupName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-medium">
                      {sub.groupName}
                    </p>
                    <Badge className={`text-xs ${status.className}`}>
                      {status.label}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                    {sub.amountCents !== null && (
                      <>
                        <span>{formatBRL(sub.amountCents)}/mês</span>
                        {sub.currentPeriodEnd && <span>·</span>}
                      </>
                    )}
                    {sub.currentPeriodEnd && sub.status !== "cancelled" && (
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        Renova em {sub.currentPeriodEnd}
                      </span>
                    )}
                  </div>
                  {sub.cancelAtPeriodEnd && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Acesso até {sub.currentPeriodEnd}
                    </p>
                  )}
                </div>

                {!sub.cancelAtPeriodEnd && sub.status !== "cancelled" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      >
                        <XCircleIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Cancelar</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancelar assinatura</DialogTitle>
                        <DialogDescription>
                          Tem certeza que deseja cancelar a assinatura do grupo{" "}
                          <strong>{sub.groupName}</strong>? Você continuará com
                          acesso até o final do período atual
                          {sub.currentPeriodEnd && (
                            <> ({sub.currentPeriodEnd})</>
                          )}
                          .
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Manter assinatura</Button>
                        </DialogClose>
                        <Button variant="destructive">
                          <XCircleIcon />
                          Cancelar assinatura
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
