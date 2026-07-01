import { getAdminMatchDetail } from "@/actions/admin/matches/detail";
import { AdminPageShell } from "@/app/admin/_components/admin-page-shell";
import { MatchAdminDetailView } from "@/app/admin/matches/_components/match-admin-detail-view";
import { Button } from "@/components/ui/button";
import { getStatusLabel } from "@/utils/status";
import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminMatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminMatchDetail({ matchId: id });

  if (result.serverError && !result.data) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/matches">
              <ChevronLeftIcon className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
        </div>
        <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-6">
          <h2 className="text-base font-semibold tracking-tight">
            Erro ao carregar partida
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ocorreu um erro ao buscar os dados da partida. Tente novamente mais
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
    <AdminPageShell
      title={result.data.match.title}
      description={getStatusLabel(result.data.match.status)}
      contentClassName="space-y-4"
    >
      <Button variant="outline" size="sm" asChild className="w-fit">
        <Link href="/admin/matches">
          <ChevronLeftIcon className="h-4 w-4" />
          Voltar
        </Link>
      </Button>
      <MatchAdminDetailView data={result.data} />
    </AdminPageShell>
  );
}
