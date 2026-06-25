"use client";

import { createBillingPortalSession } from "@/actions/user-plan/create-portal-session";
import type { SubscriptionSummary } from "@/actions/user-plan/get-subscription-summary";
import { PlanPickerDialog } from "@/app/(protected)/_components/plan-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  EARLY_ADOPTER_FREE_GROUPS,
  PLAN_TIER_LABELS,
} from "@/lib/user-plan/plan-tiers";
import {
  CreditCardIcon,
  ExternalLinkIcon,
  Loader2Icon,
  SparklesIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  trialing: "Período de teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelado",
  incomplete: "Incompleto",
  incomplete_expired: "Expirado",
  unpaid: "Não pago",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatLimit(value: number | null) {
  if (value === null) return "Ilimitado";
  return String(value);
}

type SubscriptionSectionProps = {
  summary: SubscriptionSummary;
};

export function SubscriptionSection({ summary }: SubscriptionSectionProps) {
  const [planPickerOpen, setPlanPickerOpen] = useState(false);
  const hasActivePlan = summary.subscription?.isEffectivelyActive === true;

  const { execute: openPortal, isExecuting: isOpeningPortal } = useAction(
    createBillingPortalSession,
    {
      onSuccess({ data }) {
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
        toast.error("Não foi possível abrir o portal de assinatura.");
      },
      onError({ error }) {
        const message =
          error.serverError != null
            ? String(error.serverError)
            : "Não foi possível abrir o portal de assinatura.";
        toast.error(message);
      },
    },
  );

  const groupsProgress =
    summary.groupLimit > 0
      ? Math.min(100, (summary.usage.ownedGroups / summary.groupLimit) * 100)
      : summary.usage.ownedGroups > 0
        ? 100
        : 0;

  const linksCap = summary.limits.maxInviteLinksTotal;
  const linksProgress =
    linksCap != null && linksCap > 0
      ? Math.min(100, (summary.usage.activeInviteLinks / linksCap) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Assinatura</h2>
        <p className="text-muted-foreground text-sm">
          Gerencie seu plano, limites e uso da plataforma
        </p>
      </div>

      {summary.isEarlyAdopter && !hasActivePlan && (
        <div className="space-y-3 rounded-xl border border-amber-200/50 bg-linear-to-r from-amber-500/10 to-orange-500/10 p-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <Badge variant="secondary">Early Adopter</Badge>
          </div>
          <p className="text-sm leading-relaxed">
            Você pode criar até{" "}
            <strong>{EARLY_ADOPTER_FREE_GROUPS} grupos</strong> sem assinatura
            como Early Adopter.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Grupos criados</span>
              <span className="font-medium">
                {summary.usage.ownedGroups}/{EARLY_ADOPTER_FREE_GROUPS}
              </span>
            </div>
            <Progress value={groupsProgress} />
          </div>
        </div>
      )}

      {hasActivePlan && summary.subscription && (
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="text-muted-foreground h-4 w-4" />
                <h3 className="text-sm font-medium">
                  Plano {PLAN_TIER_LABELS[summary.subscription.planTier]}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Status:{" "}
                {STATUS_LABELS[summary.subscription.status] ??
                  summary.subscription.status}
              </p>
            </div>
            <Badge variant={summary.subscription.cancelAtPeriodEnd ? "secondary" : "default"}>
              {summary.subscription.cancelAtPeriodEnd
                ? "Cancela ao fim do período"
                : "Renovação automática"}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm">
            {summary.subscription.cancelAtPeriodEnd
              ? `Acesso até ${formatDate(summary.subscription.currentPeriodEnd)}`
              : `Próxima renovação em ${formatDate(summary.subscription.currentPeriodEnd)}`}
          </p>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grupos</span>
                <span className="font-medium">
                  {summary.usage.ownedGroups}/{formatLimit(summary.limits.maxGroups)}
                </span>
              </div>
              <Progress value={groupsProgress} />
            </div>

            {linksCap != null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Links de convite ativos</span>
                  <span className="font-medium">
                    {summary.usage.activeInviteLinks}/{formatLimit(linksCap)}
                  </span>
                </div>
                <Progress value={linksProgress} />
              </div>
            )}

            {summary.limits.maxMembersPerGroup != null && (
              <p className="text-muted-foreground text-sm">
                Até {summary.limits.maxMembersPerGroup} membros por grupo
              </p>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            disabled={isOpeningPortal}
            onClick={() => openPortal()}
          >
            {isOpeningPortal ? (
              <>
                <Loader2Icon className="h-4 w-4 animate-spin" />
                Abrindo portal…
              </>
            ) : (
              <>
                <ExternalLinkIcon className="h-4 w-4" />
                Gerenciar assinatura
              </>
            )}
          </Button>
        </div>
      )}

      {!hasActivePlan && (
        <div className="space-y-4 rounded-xl border border-dashed p-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            {summary.isEarlyAdopter
              ? "Assine um plano para criar mais grupos e desbloquear limites de membros e links de convite."
              : "Assine um plano para criar grupos e gerenciar sua comunidade na plataforma."}
          </p>
          <Button className="w-full" onClick={() => setPlanPickerOpen(true)}>
            <CreditCardIcon className="h-4 w-4" />
            Ver planos
          </Button>
        </div>
      )}

      <PlanPickerDialog
        open={planPickerOpen}
        onOpenChange={setPlanPickerOpen}
        reason={hasActivePlan ? "upgrade" : "plan_required"}
        currentTier={summary.subscription?.planTier}
        ownedGroups={summary.usage.ownedGroups}
      />
    </div>
  );
}
