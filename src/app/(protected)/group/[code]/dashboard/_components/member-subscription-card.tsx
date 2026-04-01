"use client";

import { getMembershipPlan } from "@/actions/membership/get-membership-plan";
import { getSubscription } from "@/actions/membership/get-subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemberStore } from "@/app/(protected)/group/[code]/_store/group";
import { formatBRL } from "@/lib/payments";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheckIcon,
  CalendarXIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { useState } from "react";
import {
  CancelSubscriptionButton,
  SubscriptionModal,
} from "./subscription-modal";

interface MemberSubscriptionCardProps {
  organizationCode: string;
}

export function MemberSubscriptionCard({
  organizationCode,
}: MemberSubscriptionCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const memberRole = useMemberStore((s) => s.member?.role);

  const { data: plan, isLoading: isLoadingPlan } = useQuery({
    queryKey: ["membership-plan", organizationCode],
    queryFn: async () =>
      getMembershipPlan({ organizationCode }).then((res) => res?.data ?? null),
  });

  const {
    data: subscription,
    isLoading: isLoadingSub,
    refetch: refetchSub,
  } = useQuery({
    queryKey: ["subscription", organizationCode],
    queryFn: async () =>
      getSubscription({ organizationCode }).then((res) => res?.data ?? null),
  });

  const isLoading = isLoadingPlan || isLoadingSub;

  // Convidados não têm acesso ao plano mensal
  if (memberRole === "guest") return null;

  // Sem plano configurado pelo organizer → não exibe o card
  if (!isLoading && !plan) return null;

  const handleSubscribed = () => {
    setModalOpen(false);
    refetchSub();
    queryClient.invalidateQueries({
      queryKey: ["subscription", organizationCode],
    });
  };

  const handleCancelled = () => {
    refetchSub();
    queryClient.invalidateQueries({
      queryKey: ["subscription", organizationCode],
    });
  };

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";
  const isCancellingAtPeriodEnd = isActive && subscription?.cancelAtPeriodEnd;
  const periodEndDate = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")
    : null;

  return (
    <>
      <Card className="bg-card @container/card w-full border shadow-sm">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-foreground flex items-center gap-3 font-medium">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <SparklesIcon className="text-muted-foreground h-5 w-5" />
            </div>
            Assinatura
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Carregando...
            </div>
          ) : isCancellingAtPeriodEnd ? (
            // ── Cancelada mas ainda válida até o fim do período ───────────────
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarXIcon className="size-5 shrink-0 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Assinatura cancelada</p>
                  {periodEndDate && (
                    <p className="text-muted-foreground text-xs">
                      Acesso garantido até{" "}
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        {periodEndDate}
                      </span>
                    </p>
                  )}
                </div>
                <Badge className="shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Cancelado
                </Badge>
              </div>

              <p className="text-muted-foreground text-xs">
                Você ainda pode participar de partidas gratuitamente até o fim
                do período pago. Após essa data, será necessário assinar
                novamente.
              </p>
            </div>
          ) : isActive ? (
            // ── Assinatura ativa ─────────────────────────────────────────────
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarCheckIcon className="text-primary size-5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Assinatura ativa —{" "}
                    <span className="text-primary">
                      {formatBRL(plan!.amountCents)}/mês
                    </span>
                  </p>
                  {periodEndDate && (
                    <p className="text-muted-foreground text-xs">
                      Próxima cobrança em {periodEndDate}
                    </p>
                  )}
                </div>
                <Badge className="shrink-0 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Ativo
                </Badge>
              </div>

              <p className="text-muted-foreground text-xs">
                Você está isento de pagar por partidas enquanto sua assinatura
                estiver ativa.
              </p>

              <CancelSubscriptionButton
                organizationCode={organizationCode}
                onCancelled={handleCancelled}
              />
            </div>
          ) : (
            // ── Sem assinatura ───────────────────────────────────────────────
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarXIcon className="text-muted-foreground size-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Sem assinatura ativa</p>
                  <p className="text-muted-foreground text-xs">
                    Por{" "}
                    <span className="font-medium">
                      {formatBRL(plan!.amountCents)}/mês
                    </span>{" "}
                    você fica isento de pagar por cada partida.
                  </p>
                </div>
              </div>

              <Button onClick={() => setModalOpen(true)} size="sm">
                <SparklesIcon className="size-4" />
                Assinar plano mensal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {plan && (
        <SubscriptionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          organizationCode={organizationCode}
          amountCents={plan.amountCents}
          onSubscribed={handleSubscribed}
        />
      )}
    </>
  );
}
