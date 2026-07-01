"use client";

import { AdminDateRangeFilter } from "@/app/admin/_components/admin-date-range-filter";
import { useRouter } from "next/navigation";

export function ModerationDashboardClient({
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
          <h2 className="text-lg font-semibold tracking-tight">Moderação</h2>
          <p className="text-muted-foreground text-sm">
            Qualidade da comunidade e punições cross-grupo
          </p>
        </div>
        <AdminDateRangeFilter
          value={days}
          onChange={(newDays) =>
            router.push(`/admin/moderation?days=${newDays}`)
          }
        />
      </div>
      {children}
    </div>
  );
}
