"use client";

import { AdminDateRangeFilter } from "@/app/admin/_components/admin-date-range-filter";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AdminPageToolbarProps {
  days: number;
  basePath: string;
  filterHint?: string;
  className?: string;
}

export function AdminPageToolbar({
  days,
  basePath,
  filterHint = "Filtro aplicado ao gráfico e métricas do período",
  className,
}: AdminPageToolbarProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end",
        className,
      )}
    >
      <p className="text-muted-foreground hidden text-xs sm:block">
        {filterHint}
      </p>
      <AdminDateRangeFilter
        value={days}
        onChange={(newDays) => router.push(`${basePath}?days=${newDays}`)}
      />
    </div>
  );
}
