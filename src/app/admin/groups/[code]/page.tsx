import { getAdminGroupDetail } from "@/actions/admin/groups/detail";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { GroupAdminDetailView } from "@/app/admin/_componentes/groups/detail/group-admin-detail-view";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminGroupDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const res = await getAdminGroupDetail({ code });

  if (res.serverError && !res.data) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/groups">
              <ChevronLeftIcon className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-6">
          <h2 className="text-base font-semibold tracking-tight">
            Erro ao carregar grupo
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ocorreu um erro ao buscar os dados do grupo. Tente novamente mais
            tarde.
          </p>
        </div>
      </div>
    );
  }

  if (!res.data) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/groups">
              <ChevronLeftIcon className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="text-sm font-medium">Grupo não encontrado</div>
          <div className="text-muted-foreground mt-1 text-xs">
            Código: <span className="font-mono">{code}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title={res.data.group.name}
          description={
            res.data.group.private ? "Grupo privado" : "Grupo público"
          }
        />
      </PageHeader>
      <PageContent className="space-y-4">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/admin/groups">
            <ChevronLeftIcon className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <GroupAdminDetailView data={res.data} />
      </PageContent>
    </PageContainer>
  );
}
