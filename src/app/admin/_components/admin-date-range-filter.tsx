"use client";

import { Button } from "@/components/ui/button";

const PRESETS = [7, 30, 90] as const;

export type AdminDateRangeFilterProps = {
  value: number;
  onChange: (days: number) => void;
};

export function AdminDateRangeFilter({
  value,
  onChange,
}: AdminDateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((days) => (
        <Button
          key={days}
          type="button"
          variant={value === days ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(days)}
        >
          {days} dias
        </Button>
      ))}
    </div>
  );
}
