import { AdminPageShell } from "@/app/admin/_components/admin-page-shell";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPageShell
      title="Dashboard"
      description="KPIs executivos, atividade e grupos em destaque"
    >
      {children}
    </AdminPageShell>
  );
}
