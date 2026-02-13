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
  CheckCircleIcon,
  PlayIcon,
  SwordsIcon,
  XCircleIcon,
} from "lucide-react";

export default function MatchesAnalysis() {
  // Dados simples baseados no schema real de partidas
  const matchStats = {
    total: 342,
    scheduled: 12,
    openRegistration: 8,
    closed: 15,
    teamSorted: 3,
    completed: 298,
    cancelled: 6,
  };

  // Dados de criação mensal
  const monthlyData = [
    { label: "Jan", value: 45 },
    { label: "Fev", value: 52 },
    { label: "Mar", value: 38 },
    { label: "Abr", value: 67 },
    { label: "Mai", value: 71 },
  ];

  // Distribuição por status
  const statusDistributionData = [
    { label: "Completas", value: 298, color: "hsl(142, 76%, 36%)" },
    { label: "Agendadas", value: 12, color: "hsl(48, 96%, 53%)" },
    { label: "Abertas", value: 8, color: "hsl(221, 83%, 53%)" },
    { label: "Canceladas", value: 6, color: "hsl(0, 84%, 60%)" },
    { label: "Ordenação", value: 3, color: "hsl(262, 83%, 58%)" },
  ];

  // Lista mock de partidas recentes
  const recentMatches = [
    {
      id: "1",
      title: "Final FIFA Championship",
      sport: "FIFA",
      category: "Competitivo",
      location: "Arena Virtual",
      status: "completed",
      date: "2024-02-10",
      players: "8/10",
    },
    {
      id: "2",
      title: "CS2 Casual Match",
      sport: "CS2",
      category: "Casual",
      location: "Dust2",
      status: "scheduled",
      date: "2024-02-15",
      players: "6/10",
    },
    {
      id: "3",
      title: "Valorant Ranked",
      sport: "Valorant",
      category: "Competitivo",
      location: "Haven",
      status: "open_registration",
      date: "2024-02-14",
      players: "4/10",
    },
    {
      id: "4",
      title: "Arena Tournament",
      sport: "Mixed",
      category: "Torneio",
      location: "Arena Central",
      status: "team_sorted",
      date: "2024-02-16",
      players: "20/20",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      scheduled: { label: "Agendada", variant: "secondary" as const },
      open_registration: { label: "Aberta", variant: "default" as const },
      closed_registration: { label: "Fechada", variant: "outline" as const },
      team_sorted: { label: "Times Formados", variant: "default" as const },
      completed: { label: "Completa", variant: "default" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const },
    };

    return (
      statusMap[status as keyof typeof statusMap] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Partidas
          </h1>
          <p className="text-muted-foreground">
            Métricas e dados das partidas criadas
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard
          title="Total"
          value={matchStats.total}
          description="Total de partidas"
          icon={SwordsIcon}
        />
        <MetricCard
          title="Agendadas"
          value={matchStats.scheduled}
          description="Programadas"
          icon={CalendarIcon}
        />
        <MetricCard
          title="Abertas"
          value={matchStats.openRegistration}
          description="Aceitando jogadores"
          icon={PlayIcon}
        />
        <MetricCard
          title="Times Formados"
          value={matchStats.teamSorted}
          description="Prontas para começar"
          icon={CheckCircleIcon}
        />
        <MetricCard
          title="Completas"
          value={matchStats.completed}
          description="Finalizadas"
          icon={CheckCircleIcon}
        />
        <MetricCard
          title="Canceladas"
          value={matchStats.cancelled}
          description="Canceladas"
          icon={XCircleIcon}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="matches-list">Partidas Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AdminChart
              title="Criação Mensal"
              description="Novas partidas por mês"
              data={monthlyData}
              type="bar"
            />
            <AdminChart
              title="Status das Partidas"
              description="Distribuição por status"
              data={statusDistributionData}
              type="donut"
            />
          </div>
        </TabsContent>

        <TabsContent value="matches-list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Partidas Recentes</CardTitle>
              <CardDescription>
                Últimas partidas criadas na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Esporte</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Jogadores</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentMatches.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium">
                        {match.title}
                      </TableCell>
                      <TableCell>{match.sport}</TableCell>
                      <TableCell>{match.category}</TableCell>
                      <TableCell>{match.location}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadge(match.status).variant}>
                          {getStatusBadge(match.status).label}
                        </Badge>
                      </TableCell>
                      <TableCell>{match.players}</TableCell>
                      <TableCell>
                        {new Date(match.date).toLocaleDateString("pt-BR")}
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
