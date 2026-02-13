import { AdminChart } from "@/app/admin/_components/admin-chart";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookIcon, CheckCircleIcon, PlayIcon, UsersIcon } from "lucide-react";
import { TutorialProgressTable } from "../dashboard/_components/tutorial-progress-table";

export default function TutorialMetrics() {
  // Dados mock baseados no schema real
  const tutorialOverview = {
    totalSections: 8,
    totalSteps: 24,
    activeSections: 7,
    totalUsers: 156,
    usersWithProgress: 89,
    completionRate: 57.1,
  };

  // Dados por categoria baseados no tutorialCategoryEnum
  const categoryData = [
    { category: "basic", sections: 4, completed: 78, progress: 23 },
    { category: "intermediate", sections: 3, completed: 34, progress: 18 },
    { category: "advanced", sections: 1, completed: 8, progress: 12 },
  ];

  // Dados para gráficos
  const completionTrend = [
    { month: "Jan", completed: 45, started: 78 },
    { month: "Fev", completed: 62, started: 89 },
    { month: "Mar", completed: 78, started: 98 },
  ];

  const categoryDistribution = [
    { label: "Básico", value: 78, fill: "hsl(var(--chart-1))" },
    { label: "Intermediário", value: 34, fill: "hsl(var(--chart-2))" },
    { label: "Avançado", value: 8, fill: "hsl(var(--chart-3))" },
  ];

  // Usuários recentes com progresso
  const recentUsers = [
    { name: "Ana Silva", sections: 4, steps: 12, lastActivity: "2024-01-15" },
    { name: "João Santos", sections: 2, steps: 8, lastActivity: "2024-01-14" },
    { name: "Maria Costa", sections: 6, steps: 18, lastActivity: "2024-01-13" },
    {
      name: "Pedro Oliveira",
      sections: 1,
      steps: 3,
      lastActivity: "2024-01-12",
    },
  ];

  function getCategoryBadge(category: string) {
    const colors = {
      basic:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      intermediate:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return colors[category as keyof typeof colors] || colors.basic;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Métricas do Tutorial</h1>
        <p className="text-muted-foreground">
          Análise do progresso dos usuários no sistema de tutorial
        </p>
      </div>

      {/* Métricas principais */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Seções"
          value={tutorialOverview.totalSections}
          icon={BookIcon}
          description={`${tutorialOverview.activeSections} ativas`}
        />
        <MetricCard
          title="Total de Passos"
          value={tutorialOverview.totalSteps}
          icon={PlayIcon}
          trend={{ value: 8.3, isPositive: true }}
        />
        <MetricCard
          title="Usuários com Progresso"
          value={tutorialOverview.usersWithProgress}
          icon={UsersIcon}
          description={`de ${tutorialOverview.totalUsers} usuários`}
        />
        <MetricCard
          title="Taxa de Conclusão"
          value={`${tutorialOverview.completionRate}%`}
          icon={CheckCircleIcon}
          trend={{ value: 12.5, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sections">Por Seção</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Progresso por categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Categoria</CardTitle>
                <CardDescription>
                  Distribuição do progresso por nível de dificuldade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getCategoryBadge(cat.category)}>
                            {cat.category}
                          </Badge>
                          <span className="text-muted-foreground text-sm">
                            {cat.sections} seções
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {cat.completed} concluídos
                        </span>
                      </div>
                      <Progress
                        value={
                          (cat.completed / (cat.completed + cat.progress)) * 100
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tendência de conclusão */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Conclusão</CardTitle>
                <CardDescription>
                  Usuários que iniciaram vs completaram por mês
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-2xl font-bold">
                    {completionTrend.reduce(
                      (acc, item) => acc + item.completed,
                      0,
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Usuários completaram o tutorial nos últimos 3 meses
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Conclusões</CardTitle>
                <CardDescription>
                  Número de conclusões por categoria de tutorial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminChart
                  title="Distribuição por Categoria"
                  data={categoryDistribution}
                  type="pie"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <TutorialProgressTable />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários com Progresso Recente</CardTitle>
              <CardDescription>
                Usuários que fizeram progresso no tutorial recentemente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Seções Concluídas</TableHead>
                    <TableHead>Passos Concluídos</TableHead>
                    <TableHead>Última Atividade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.name}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>
                        <Badge>{user.sections} seções</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.steps} passos</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.lastActivity).toLocaleDateString(
                          "pt-BR",
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
