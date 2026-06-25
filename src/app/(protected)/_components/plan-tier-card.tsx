"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PLAN_LIMITS,
  PLAN_TIER_LABELS,
  PLAN_TIER_PRICES,
} from "@/lib/user-plan/plan-tiers";
import type { PlanTier } from "@/lib/user-plan/types";
import { cn } from "@/lib/utils";
import { CheckIcon, Loader2Icon } from "lucide-react";

type PlanTierCardProps = {
  tier: PlanTier;
  highlighted?: boolean;
  isCurrent?: boolean;
  onSelect: (tier: PlanTier) => void;
  loading?: boolean;
};

function formatLimit(value: number | null, singular: string, plural: string) {
  if (value === null) return "Ilimitado";
  return `${value} ${value === 1 ? singular : plural}`;
}

export function PlanTierCard({
  tier,
  highlighted = false,
  isCurrent = false,
  onSelect,
  loading = false,
}: PlanTierCardProps) {
  const limits = PLAN_LIMITS[tier];
  const features = [
    formatLimit(limits.maxGroups, "grupo", "grupos"),
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
  ];

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col gap-0 py-0 shadow-sm",
        highlighted && "border-primary ring-primary/20 ring-1",
      )}
    >
      {highlighted && (
        <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-xs font-medium">
          Popular
        </div>
      )}
      <CardHeader className="gap-1 border-b px-4 py-4">
        <CardTitle className="text-base">{PLAN_TIER_LABELS[tier]}</CardTitle>
        <CardDescription className="text-foreground text-xl font-semibold">
          {PLAN_TIER_PRICES[tier]}
          <span className="text-muted-foreground text-sm font-normal">
            /mês
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-4 py-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li
              key={`${feature}-${index}`}
              className="flex items-start gap-2 text-sm"
            >
              <CheckIcon className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="px-4 pb-4">
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          disabled={loading || isCurrent}
          onClick={() => onSelect(tier)}
        >
          {loading ? (
            <>
              <Loader2Icon className="h-4 w-4 animate-spin" />
              Aguarde…
            </>
          ) : isCurrent ? (
            "Plano atual"
          ) : (
            "Assinar"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
