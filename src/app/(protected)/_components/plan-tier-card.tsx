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
        "relative flex h-full flex-col gap-0 overflow-hidden py-0 transition-shadow",
        highlighted
          ? "border-primary/40 shadow-md ring-1 ring-primary/15"
          : "shadow-sm hover:shadow-md",
        isCurrent && "opacity-90",
      )}
    >
      {highlighted && (
        <div className="bg-primary text-primary-foreground absolute top-0 right-0 left-0 py-1 text-center text-[11px] font-semibold tracking-wide uppercase">
          Mais popular
        </div>
      )}
      <CardHeader
        className={cn(
          "gap-1 px-5 pb-4",
          highlighted ? "border-primary/10 bg-primary/5 pt-8" : "border-b pt-5",
        )}
      >
        <CardTitle className="text-base font-semibold">
          {PLAN_TIER_LABELS[tier]}
        </CardTitle>
        <CardDescription className="text-foreground pt-1">
          <span className="text-3xl font-bold tracking-tight">
            {PLAN_TIER_PRICES[tier]}
          </span>
          <span className="text-muted-foreground text-sm font-normal">
            /mês
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 px-5 py-5">
        <ul className="space-y-2.5">
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
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="px-5 pt-0 pb-5">
        <Button
          className="w-full"
          variant={highlighted ? "default" : "outline"}
          disabled={loading || isCurrent}
          onClick={() => onSelect(tier)}
        >
          {loading ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
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
