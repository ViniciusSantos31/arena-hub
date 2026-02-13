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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarIcon,
  LockIcon,
  TrendingUpIcon,
  UnlockIcon,
  UsersRoundIcon,
} from "lucide-react";

export default function GroupsAnalysis() {
  // Dados simples baseados no schema real (organizações)
  const groupStats = {
    total: 89,
    withMembers: 67,
    private: 23,
    public: 66,
    thisMonth: 12,
  };

  // Dados de crescimento mensal
  const monthlyGrowthData = [
    { label: "Jan", value: 8 },
    { label: "Fev", value: 12 },
    { label: "Mar", value: 15 },
    { label: "Abr", value: 9 },
    { label: "Mai", value: 11 },
  ];

  // Distribuição por tipo
  const typeDistributionData = [
    { label: "Público", value: 66, color: "hsl(142, 76%, 36%)" },
    { label: "Privado", value: 23, color: "hsl(48, 96%, 53%)" },
  ];

  // Lista mock de grupos recentes
  const recentGroups = [
    {
      id: "1",
      name: "FIFA Champions",
      slug: "fifa-champions",
      code: "ABC123",
      private: false,
      members: 12,
      maxPlayers: 20,
      createdAt: "2024-02-10",
    },
    {
      id: "2",
      name: "CS2 Pro Players",
      slug: "cs2-pro",
      code: "DEF456",
      private: true,
      members: 8,
      maxPlayers: 10,
      createdAt: "2024-02-11",
    },
    {
      id: "3",
      name: "Valorant Squad",
      slug: "valorant-squad",
      code: "GHI789",
      private: false,
      members: 15,
      maxPlayers: 25,
      createdAt: "2024-02-11",
    },
    {
      id: "4",
      name: "Arena Gamers",
      slug: "arena-gamers",
      code: "JKL012",
      private: false,
      members: 5,
      maxPlayers: 15,
      createdAt: "2024-02-12",
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Grupos
          </h1>
          <p className="text-muted-foreground">
            Métricas e dados dos grupos (organizações) criados
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total de Grupos"
          value={groupStats.total}
          description="Grupos criados"
          icon={UsersRoundIcon}
        />
        <MetricCard
          title="Com Membros"
          value={groupStats.withMembers}
          description="Grupos com pelo menos 1 membro"
          icon={TrendingUpIcon}
        />
        <MetricCard
          title="Públicos"
          value={groupStats.public}
          description="Grupos abertos"
          icon={UnlockIcon}
        />
        <MetricCard
          title="Privados"
          value={groupStats.private}
          description="Grupos fechados"
          icon={LockIcon}
        />
        <MetricCard
          title="Novos este Mês"
          value={groupStats.thisMonth}
          description="Criados em fevereiro"
          icon={CalendarIcon}
          trend={{ value: 20.5, isPositive: true }}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="groups-list">Grupos Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AdminChart
              title="Crescimento Mensal"
              description="Novos grupos por mês"
              data={monthlyGrowthData}
              type="bar"
            />
            <AdminChart
              title="Tipo de Grupo"
              description="Distribuição público vs privado"
              data={typeDistributionData}
              type="donut"
            />
          </div>
        </TabsContent>

        <TabsContent value="groups-list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grupos Recentes</CardTitle>
              <CardDescription>
                Últimos grupos criados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Capacidade</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentGroups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        {group.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{group.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {group.private ? (
                            <LockIcon className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <UnlockIcon className="h-4 w-4 text-green-600" />
                          )}
                          <span>{group.private ? "Privado" : "Público"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{group.members}</TableCell>
                      <TableCell>{group.maxPlayers}</TableCell>
                      <TableCell>
                        {new Date(group.createdAt).toLocaleDateString("pt-BR")}
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
