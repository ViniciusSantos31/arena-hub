import { getAllTutorialSectionsForAdmin } from "@/actions/tutorial/admin";
import { AdminPageShell } from "@/app/admin/_components/admin-page-shell";
import { TutorialContentAdmin } from "@/app/admin/tutorial/content/_components/tutorial-content-admin";

export const dynamic = "force-dynamic";

export default async function AdminTutorialContentPage() {
  const result = await getAllTutorialSectionsForAdmin();

  if (result.serverError && !result.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar conteúdo
        </h2>
        <p className="text-muted-foreground">
          Não foi possível buscar as seções do tutorial. Tente novamente.
        </p>
      </div>
    );
  }

  const sections = result.data ?? [];

  return (
    <AdminPageShell
      title="Conteúdo do Tutorial"
      description="Gerencie seções e passos exibidos no onboarding"
    >
      <TutorialContentAdmin sections={sections} />
    </AdminPageShell>
  );
}
