import { getAdminUserDetail } from "@/actions/admin/users/detail";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { UserAdminDetailView } from "@/app/admin/users/_components/user-admin-detail-view";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminUserDetail({ userId: id });

  if (result.serverError && !result.data) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <ChevronLeftIcon className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-6">
          <h2 className="text-base font-semibold tracking-tight">
            Erro ao carregar usuário
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ocorreu um erro ao buscar os dados do usuário. Tente novamente mais
            tarde.
          </p>
        </div>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title={result.data.profile.name}
          description={result.data.profile.email}
        />
      </PageHeader>
      <PageContent className="space-y-4">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/admin/users">
            <ChevronLeftIcon className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <UserAdminDetailView data={result.data} />
      </PageContent>
    </PageContainer>
  );
}
