import { adminListFeatureAnnouncements } from "@/actions/feature-announcements/admin";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { FeatureAnnouncementsAdmin } from "@/app/admin/announcements/_components/feature-announcements-admin";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const res = await adminListFeatureAnnouncements();

  if (res.serverError && !res.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar novidades
        </h2>
      </div>
    );
  }

  const announcements = res.data?.announcements ?? [];

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Novidades"
          description="Gerencie modais de novidades exibidos para usuários elegíveis"
        />
      </PageHeader>
      <PageContent className="space-y-4">
        <FeatureAnnouncementsAdmin announcements={announcements} />
      </PageContent>
    </PageContainer>
  );
}

