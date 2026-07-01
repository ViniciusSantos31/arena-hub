"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRESETS = [7, 30, 90] as const;

export type AdminDateRangeFilterProps = {
  value: number;
  onChange: (days: number) => void;
  className?: string;
};

export function AdminDateRangeFilter({
  value,
  onChange,
  className,
}: AdminDateRangeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Selecionar período em dias"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {PRESETS.map((days) => (
        <Button
          key={days}
          type="button"
          variant={value === days ? "default" : "outline"}
          size="sm"
          aria-pressed={value === days}
          onClick={() => onChange(days)}
        >
          {days} dias
        </Button>
      ))}
    </div>
  );
}
