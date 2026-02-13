import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Dashboard"
          description="Visão geral das métricas e atividades recentes"
        />
      </PageHeader>
      <PageContent>{children}</PageContent>
    </PageContainer>
  );
}
