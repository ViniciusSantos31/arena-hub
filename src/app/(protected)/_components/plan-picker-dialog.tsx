"use client";

import { createPlanCheckoutSession } from "@/actions/user-plan/create-checkout-session";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  PLAN_TIERS,
  PLAN_TIER_LABELS,
} from "@/lib/user-plan/plan-tiers";
import type { PlanPickerReason, PlanTier } from "@/lib/user-plan/types";
import { CreditCardIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { PlanTierCard } from "./plan-tier-card";

type PlanPickerDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  reason: PlanPickerReason;
  currentTier?: PlanTier;
  ownedGroups?: number;
};

const REASON_COPY: Record<
  PlanPickerReason,
  { title: string; description: string; extra?: string }
> = {
  plan_required: {
    title: "Plano necessário",
    description: "Assine um plano para criar seu grupo.",
  },
  group_limit: {
    title: "Limite de grupos",
    description: "Você atingiu o limite de grupos permitido.",
  },
  early_adopter_limit: {
    title: "Limite de Early Adopter",
    description: "Você atingiu o limite gratuito de grupos.",
    extra:
      "Você é um Early Adopter e pode criar até 2 grupos sem assinatura. Para criar um terceiro grupo, assine um dos nossos planos.",
  },
  upgrade: {
    title: "Faça upgrade do seu plano",
    description: "Seu plano atual atingiu o limite de grupos.",
  },
  subscription_required_for_match: {
    title: "Assinatura necessária",
    description:
      "A assinatura do organizador não está ativa. Regularize o plano para criar novas partidas.",
  },
};

export function PlanPickerDialog({
  open,
  onOpenChange,
  reason,
  currentTier,
  ownedGroups,
}: PlanPickerDialogProps) {
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const copy = REASON_COPY[reason];

  const { execute } = useAction(createPlanCheckoutSession, {
    onSuccess({ data }) {
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      toast.error("Não foi possível iniciar o pagamento.");
      setLoadingTier(null);
    },
    onError({ error }) {
      const message =
        error.serverError != null
          ? String(error.serverError)
          : "Não foi possível iniciar o pagamento.";
      toast.error(message);
      setLoadingTier(null);
    },
  });

  const handleSelect = (tier: PlanTier) => {
    setLoadingTier(tier);
    execute({ planTier: tier });
  };

  const description =
    reason === "upgrade" && ownedGroups != null
      ? `${copy.description} Você possui ${ownedGroups} grupo(s).`
      : copy.description;

  return (
    <ResponsiveDialog
      title={copy.title}
      icon={CreditCardIcon}
      description={description}
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton={false}
      className="sm:max-w-4xl"
      contentClassName="space-y-5"
      content={
        <div className="space-y-5">
          {copy.extra && (
            <p className="text-muted-foreground rounded-xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 to-orange-500/5 p-4 text-sm leading-relaxed">
              {copy.extra}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {PLAN_TIERS.map((tier) => (
              <PlanTierCard
                key={tier}
                tier={tier}
                highlighted={tier === "intermediate"}
                isCurrent={currentTier === tier}
                loading={loadingTier === tier}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {currentTier && (
            <p className="text-muted-foreground text-center text-xs">
              Plano atual: {PLAN_TIER_LABELS[currentTier]}
            </p>
          )}
        </div>
      }
    />
  );
}
