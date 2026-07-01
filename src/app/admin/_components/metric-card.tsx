import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

const metricCardVariants = cva("border-border/60 relative h-full overflow-hidden", {
  variants: {
    variant: {
      default: "",
      hero: "bg-muted/20",
      compact: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const valueVariants = cva("font-bold tabular-nums tracking-tight", {
  variants: {
    variant: {
      default: "text-2xl",
      hero: "text-3xl sm:text-4xl",
      compact: "text-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface MetricCardProps extends VariantProps<typeof metricCardVariants> {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <Card className={cn(metricCardVariants({ variant }), className)}>
      <CardContent
        className={cn("p-4", variant === "hero" && "p-5 sm:p-6")}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "bg-primary/10 flex shrink-0 items-center justify-center rounded-lg",
              variant === "hero" ? "h-10 w-10" : "h-9 w-9",
            )}
            aria-hidden="true"
          >
            <Icon className="text-primary h-4 w-4" />
          </div>
          {badge && (
            <Badge variant={badge.variant || "default"} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-0.5">
          <p className={valueVariants({ variant })}>{value}</p>
          <p className="text-sm font-medium leading-snug">{title}</p>
          {description && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1.5 flex items-center text-xs font-medium",
                trend.isPositive ? "text-primary" : "text-destructive",
              )}
              aria-label={`${trend.isPositive ? "Aumento" : "Queda"} de ${Math.abs(trend.value)}% em relação ao mês anterior`}
            >
              <span aria-hidden="true" className="mr-1">
                {trend.isPositive ? "↗" : "↘"}
              </span>
              {Math.abs(trend.value)}% vs. mês anterior
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
