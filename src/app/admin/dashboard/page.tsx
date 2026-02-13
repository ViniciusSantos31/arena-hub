import { adminResume } from "@/actions/admin/resume";
import { getTutorialOverallStats } from "@/actions/admin/tutorial";
import { RefreshDataButton } from "./_components/refresh-data-button";
import { ResumeChart } from "./_components/resume-chart";
import { TutorialProgressTable } from "./_components/tutorial-progress-table";
import { UserTutorialChart } from "./_components/user-tutorial-chart";

export default async function AdminDashboard() {
  const resume = await adminResume();
  const tutorialStats = await getTutorialOverallStats();

  if (resume.serverError && !resume.data) {
    return (
      <div className="flex-1 items-center justify-center space-y-6 p-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Erro ao carregar dados
        </h2>
        <p className="text-muted-foreground">
          Ocorreu um erro ao buscar os dados para o dashboard. Por favor, tente
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
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="ml-auto flex items-center space-x-2">
          <RefreshDataButton />
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-5">
        <div className="col-span-1 lg:col-span-3">
          <ResumeChart data={data || []} />
        </div>
        <div className="col-span-1 md:col-span-2">
          <UserTutorialChart data={tutorialStats.data} />
        </div>
        {/* <GroupsChart className="h-full md:col-span-2" /> */}
        <TutorialProgressTable className="col-span-1 **:text-xs md:col-span-4 **:md:text-sm lg:col-span-full" />
      </div>
    </div>
  );
}
