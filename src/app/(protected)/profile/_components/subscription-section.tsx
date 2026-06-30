"use client";

import { createBillingPortalSession } from "@/actions/user-plan/create-portal-session";
import { PlanPickerDialog } from "@/app/(protected)/_components/plan-picker-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  EARLY_ADOPTER_FREE_GROUPS,
  PLAN_TIER_LABELS,
} from "@/lib/user-plan/plan-tiers";
import type { SubscriptionSummary } from "@/lib/user-plan/subscription-summary";
import type { SubscriptionPayment } from "@/lib/stripe-billing/list-subscription-invoices";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import {
  CalendarIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  LinkIcon,
  Loader2Icon,
  SparklesIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { SubscriptionPaymentHistory } from "./subscription-payment-history";

type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Ativo",
  trialing: "Período de teste",
  past_due: "Pagamento pendente",
  canceled: "Cancelado",
  incomplete: "Incompleto",
  incomplete_expired: "Expirado",
  unpaid: "Não pago",
};

const statusBadgeVariants = cva(
  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        active:
          "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
        trialing:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        past_due:
          "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
        canceled: "border-border bg-muted/60 text-muted-foreground",
        incomplete: "border-border bg-muted/60 text-muted-foreground",
        incomplete_expired: "border-border bg-muted/60 text-muted-foreground",
        unpaid: "border-border bg-muted/60 text-muted-foreground",
      },
    },
  },
);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatLimit(value: number | null) {
  if (value === null) return "∞";
  return String(value);
}

type UsageMetricProps = {
  icon: React.ElementType;
  label: string;
  used?: number;
  limit: number | null;
};

function UsageMetric({ icon: Icon, label, used, limit }: UsageMetricProps) {
  return (
    <div className="bg-background/80 rounded-xl border p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icon className="text-primary size-4" />
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="text-muted-foreground text-xs">{label}</p>
          {used != null ? (
            <p className="text-lg font-semibold tabular-nums">
              {used}
              <span className="text-muted-foreground text-sm font-normal">
                /{formatLimit(limit)}
              </span>
            </p>
          ) : (
            <p className="text-lg font-semibold">{formatLimit(limit)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

type SubscriptionSectionProps = {
  summary: SubscriptionSummary;
  payments: SubscriptionPayment[];
};

export function SubscriptionSection({
  summary,
  payments,
}: SubscriptionSectionProps) {
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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Assinatura</h2>
        <p className="text-muted-foreground text-sm">
          Gerencie seu plano, limites e uso da plataforma
        </p>
      </div>

      {summary.isEarlyAdopter && !hasActivePlan && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent p-5 shadow-sm">
          <div className="pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15">
                <SparklesIcon className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <Badge
                  variant="secondary"
                  className="border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                >
                  Early Adopter
                </Badge>
                <p className="mt-1 text-sm leading-relaxed">
                  Você pode criar até{" "}
                  <span className="font-semibold">
                    {EARLY_ADOPTER_FREE_GROUPS} grupos
                  </span>{" "}
                  sem assinatura.
                </p>
              </div>
            </div>
            <UsageMetric
              icon={UsersIcon}
              label="Grupos criados"
              used={summary.usage.ownedGroups}
              limit={EARLY_ADOPTER_FREE_GROUPS}
            />
          </div>
        </div>
      )}

      {hasActivePlan && summary.subscription && (
        <div className="from-primary via-primary/50 rounded-2xl bg-linear-to-br to-transparent p-px">
          <div className="bg-background overflow-hidden rounded-2xl shadow-sm">
            <div className="from-primary/8 via-primary/4 relative bg-linear-to-br to-transparent px-5 pt-5 pb-4">
              <div className="bg-primary/10 pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-3xl" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Plano atual
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {PLAN_TIER_LABELS[summary.subscription.planTier]}
                  </h3>
                  <span
                    className={statusBadgeVariants({
                      variant: summary.subscription
                        .status as SubscriptionStatus,
                    })}
                  >
                    {STATUS_LABELS[
                      summary.subscription.status as SubscriptionStatus
                    ] ?? (summary.subscription.status as SubscriptionStatus)}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1",
                    summary.subscription.cancelAtPeriodEnd
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "border-primary/20 bg-background/80",
                  )}
                >
                  {summary.subscription.cancelAtPeriodEnd
                    ? "Cancela ao fim do período"
                    : "Renovação automática"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col space-y-5 px-5 py-5">
              <div className="bg-muted/40 flex items-center gap-3 rounded-xl border px-4 py-3">
                <CalendarIcon className="text-muted-foreground size-4 shrink-0" />
                <p className="text-xs">
                  {summary.subscription.cancelAtPeriodEnd ? (
                    <>
                      <span className="text-muted-foreground">Acesso até </span>
                      <span className="font-medium">
                        {formatDate(summary.subscription.currentPeriodEnd)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-muted-foreground">
                        Próxima renovação em{" "}
                      </span>
                      <span className="font-medium">
                        {formatDate(summary.subscription.currentPeriodEnd)}
                      </span>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Uso do plano
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <UsageMetric
                    icon={UsersIcon}
                    label="Grupos"
                    used={summary.usage.ownedGroups}
                    limit={summary.limits.maxGroups}
                  />
                  <UsageMetric
                    icon={LinkIcon}
                    label="Links de convite ativos"
                    used={summary.usage.activeInviteLinks}
                    limit={summary.limits.maxInviteLinksTotal}
                  />
                  <UsageMetric
                    icon={UserIcon}
                    label="Membros por grupo"
                    limit={summary.limits.maxMembersPerGroup}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                className="ml-auto w-full sm:w-auto"
                disabled={isOpeningPortal}
                onClick={() => openPortal()}
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2Icon className="size-4 animate-spin" />
                    Abrindo portal…
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="size-4" />
                    Gerenciar assinatura
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {(hasActivePlan || payments.length > 0) && (
        <SubscriptionPaymentHistory payments={payments} />
      )}

      {!hasActivePlan && (
        <div className="relative overflow-hidden rounded-2xl border border-dashed p-6 text-center shadow-sm">
          <div className="from-muted/40 pointer-events-none absolute inset-0 bg-linear-to-b to-transparent" />
          <div className="relative space-y-5">
            <div className="bg-primary/10 mx-auto flex size-14 items-center justify-center rounded-2xl">
              <CreditCardIcon className="text-primary size-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold">
                {summary.isEarlyAdopter
                  ? "Desbloqueie mais recursos"
                  : "Comece com um plano"}
              </h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
                {summary.isEarlyAdopter
                  ? "Assine um plano para criar mais grupos e desbloquear limites de membros e links de convite."
                  : "Assine um plano para criar grupos e gerenciar sua comunidade na plataforma."}
              </p>
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={() => setPlanPickerOpen(true)}
            >
              <CreditCardIcon className="size-4" />
              Ver planos
            </Button>
          </div>
        </div>
      )}

      <PlanPickerDialog
        open={planPickerOpen}
        onOpenChange={setPlanPickerOpen}
        reason={hasActivePlan ? "upgrade" : "plan_required"}
        currentTier={
          summary.subscription?.status === "active"
            ? summary.subscription?.planTier
            : undefined
        }
        ownedGroups={summary.usage.ownedGroups}
      />
    </div>
  );
}
