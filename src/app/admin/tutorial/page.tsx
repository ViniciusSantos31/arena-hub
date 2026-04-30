import { adminResume } from "@/actions/admin/resume";
import { getTutorialOverallStats } from "@/actions/admin/tutorial";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";
import { ResumeChart } from "@/app/admin/dashboard/_components/resume-chart";
import { TutorialProgressTable } from "@/app/admin/dashboard/_components/tutorial-progress-table";
import { UserTutorialChart } from "@/app/admin/dashboard/_components/user-tutorial-chart";

export const dynamic = "force-dynamic";

export default async function AdminTutorialDashboard() {
  const resume = await adminResume();
  const tutorialStats = await getTutorialOverallStats();

  if (resume.serverError && !resume.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar dados
        </h2>
        <p className="text-muted-foreground">
          Ocorreu um erro ao buscar os dados do tutorial. Por favor, tente
          novamente mais tarde.
        </p>
      </div>
    );
  }

  const data = resume.data?.resume.map((item) => ({
    date: item.date,
    users: item.users,
    matches: item.matches,
  }));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent
          title="Tutorial"
          description="Acompanhamento de progresso e impacto do tutorial na plataforma"
        />
      </PageHeader>
      <PageContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-1 lg:col-span-3">
            <ResumeChart data={data || []} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <UserTutorialChart data={tutorialStats.data} />
          </div>
          <TutorialProgressTable className="col-span-1 **:text-xs md:col-span-4 **:md:text-sm lg:col-span-full" />
        </div>
      </PageContent>
    </PageContainer>
  );
}
