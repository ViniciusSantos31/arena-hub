import type { MatchPlayer } from "@/app/(protected)/group/[code]/matches/(detail)/[id]/types";
import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export function getMatchPaymentStatusPresentation(
  status: MatchPlayer["paymentStatus"] | undefined,
): {
  label: string;
  variant: BadgeVariant;
  className?: string;
} {
  const s = status ?? "pending";
  switch (s) {
    case "paid":
      return {
        label: "Pago",
        variant: "outline",
        className:
          "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
      };
    case "exempt":
      return {
        label: "Isento",
        variant: "secondary",
      };
    case "refunded":
      return {
        label: "Estornado",
        variant: "outline",
        className: "text-muted-foreground border-dashed",
      };
    default:
      return {
        label: "Pendente",
        variant: "outline",
        className:
          "border-amber-500/40 bg-amber-500/5 text-amber-800 dark:text-amber-300",
      };
  }
}

export type MatchPaymentCounts = {
  paid: number;
  pending: number;
  exempt: number;
  refunded: number;
};

export function countMatchPlayerPayments(players: MatchPlayer[]): MatchPaymentCounts {
  const c: MatchPaymentCounts = {
    paid: 0,
    pending: 0,
    exempt: 0,
    refunded: 0,
  };
  for (const p of players) {
    const k = (p.paymentStatus ?? "pending") as keyof MatchPaymentCounts;
    if (k in c) {
      c[k]++;
    }
  }
  return c;
}
