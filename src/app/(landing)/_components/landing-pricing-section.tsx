import { Button } from "@/components/ui/button";
import {
  EARLY_ADOPTER_FREE_GROUPS,
  PLAN_LIMITS,
  PLAN_TIER_LABELS,
  PLAN_TIER_PRICES,
  PLAN_TIERS,
} from "@/lib/user-plan/plan-tiers";
import type { PlanTier } from "@/lib/user-plan/types";
import { cn } from "@/lib/utils";
import { CheckIcon, SparklesIcon, UsersIcon } from "lucide-react";
import Link from "next/link";

function formatLimit(value: number | null, singular: string, plural: string) {
  if (value === null) return "Ilimitado";
  return `${value} ${value === 1 ? singular : plural}`;
}

function getPlanFeatures(tier: PlanTier) {
  const limits = PLAN_LIMITS[tier];
  return [
    formatLimit(limits.maxGroups, "grupo próprio", "grupos próprios"),
    formatLimit(
      limits.maxMembersPerGroup,
      "membro por grupo",
      "membros por grupo",
    ),
    formatLimit(
      limits.maxInviteLinksTotal,
      "link de convite",
      "links de convite",
    ),
    "Sorteio de times e ranking",
    "Notificações push",
  ];
}

type LandingPricingCardProps = {
  tier: PlanTier;
  highlighted?: boolean;
};

function LandingPricingCard({
  tier,
  highlighted = false,
}: LandingPricingCardProps) {
  const features = getPlanFeatures(tier);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200",
        highlighted
          ? "border-primary/40 bg-card ring-primary/15 shadow-lg ring-1"
          : "border-border/60 bg-card/50 hover:border-primary/20 hover:shadow-md",
      )}
    >
      {highlighted && (
        <div className="bg-primary text-primary-foreground absolute -top-px right-6 left-6 rounded-b-lg py-1 text-center text-[11px] font-semibold tracking-wide uppercase">
          Mais popular
        </div>
      )}

      <div className={cn("mb-6", highlighted && "pt-5")}>
        <p className="text-muted-foreground mb-1 text-sm font-medium">
          {PLAN_TIER_LABELS[tier]}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-foreground text-4xl font-bold tracking-tight">
            {PLAN_TIER_PRICES[tier]}
          </span>
          <span className="text-muted-foreground text-sm">/mês</span>
        </div>
      </div>

      <ul className="mb-8 flex flex-1 flex-col gap-3">
        {features.map((feature, index) => (
          <li
            key={`${feature}-${index}`}
            className="flex items-start gap-2.5 text-sm"
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                highlighted ? "bg-primary/15" : "bg-muted",
              )}
            >
              <CheckIcon
                className={cn(
                  "size-3",
                  highlighted ? "text-primary" : "text-muted-foreground",
                )}
              />
            </span>
            <span className="text-foreground/90">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={highlighted ? "default" : "outline"}
        className="w-full"
      >
        <Link href="/auth/sign-up">Começar agora</Link>
      </Button>
    </div>
  );
}

export function LandingPricingSection() {
  return (
    <section
      id="planos"
      className="border-border/60 bg-muted/20 border-y px-4 py-24"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <SparklesIcon className="size-3.5" />
            Planos simples e transparentes
          </div>
          <h2 className="text-foreground mb-3 text-4xl font-bold md:text-5xl">
            Escolha o plano ideal
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Pague apenas para{" "}
            <strong className="text-foreground font-medium">organizar</strong>{" "}
            seus grupos. Participar de peladas continua gratuito para todos os
            jogadores.
          </p>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-3">
          {PLAN_TIERS.map((tier) => (
            <LandingPricingCard
              key={tier}
              tier={tier}
              highlighted={tier === "intermediate"}
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-border/60 bg-card/40 flex items-start gap-4 rounded-2xl border p-5 backdrop-blur-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
              <UsersIcon className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-foreground mb-1 font-semibold">
                Jogadores não pagam
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Entrar em grupos, confirmar presença e participar de partidas é
                sempre gratuito — sem assinatura.
              </p>
            </div>
          </div>

          <div className="border-border/60 bg-card/40 flex items-start gap-4 rounded-2xl border p-5 backdrop-blur-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <SparklesIcon className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-foreground mb-1 font-semibold">
                Early Adopters
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Quem já organizava grupos antes do lançamento pode criar até{" "}
                {EARLY_ADOPTER_FREE_GROUPS} grupos sem assinatura. Para mais,
                basta escolher um plano.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
