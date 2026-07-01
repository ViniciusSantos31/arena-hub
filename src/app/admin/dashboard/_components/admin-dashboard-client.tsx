"use client";

import { AdminDateRangeFilter } from "@/app/admin/_components/admin-date-range-filter";
import { useRouter } from "next/navigation";

export function AdminDashboardClient({
  days,
  children,
}: {
  days: number;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Visão geral</h2>
          <p className="text-muted-foreground text-sm">
            KPIs executivos da plataforma
          </p>
        </div>
        <AdminDateRangeFilter
          value={days}
          onChange={(newDays) =>
            router.push(`/admin/dashboard?days=${newDays}`)
          }
        />
      </div>
      {children}
    </div>
  );
}
