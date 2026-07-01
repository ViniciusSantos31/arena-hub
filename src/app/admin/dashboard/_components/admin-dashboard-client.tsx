"use client";

import { AdminPageToolbar } from "@/app/admin/_components/admin-page-toolbar";

export function AdminDashboardClient({
  days,
  children,
}: {
  days: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <AdminPageToolbar
        days={days}
        basePath="/admin/dashboard"
        filterHint="Período aplicado ao gráfico de atividade"
      />
      {children}
    </div>
  );
}
