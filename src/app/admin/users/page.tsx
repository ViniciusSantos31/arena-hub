import { AdminChart } from "@/app/admin/_components/admin-chart";
import { MetricCard } from "@/app/admin/_components/metric-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  ClockIcon,
  UsersIcon,
} from "lucide-react";

export default function UsersAnalysis() {
  // Dados simples baseados no schema real
  const userStats = {
    total: 1247,
    thisMonth: 89,
    lastMonth: 145,
    verified: 1156,
    unverified: 91,
  };

  // Dados de crescimento mensal
  const monthlyGrowthData = [
    { label: "Jan", value: 120 },
    { label: "Fev", value: 89 },
    { label: "Mar", value: 145 },
    { label: "Abr", value: 98 },
    { label: "Mai", value: 176 },
  ];

  // Status de verificação
  const verificationData = [
    { label: "Verificados", value: 1156, color: "hsl(142, 76%, 36%)" },
    { label: "Não Verificados", value: 91, color: "hsl(48, 96%, 53%)" },
  ];

  // Lista mock de usuários recentes
  const recentUsers = [
    {
      id: "1",
      name: "João Silva",
      email: "joao@email.com",
      createdAt: "2024-02-10",
      verified: true,
    },
    {
      id: "2",
      name: "Maria Santos",
      email: "maria@email.com",
      createdAt: "2024-02-11",
      verified: true,
    },
    {
      id: "3",
      name: "Pedro Costa",
      email: "pedro@email.com",
      createdAt: "2024-02-11",
      verified: false,
    },
    {
      id: "4",
      name: "Ana Oliveira",
      email: "ana@email.com",
      createdAt: "2024-02-12",
      verified: true,
    },
    {
      id: "5",
      name: "Carlos Lima",
      email: "carlos@email.com",
      createdAt: "2024-02-12",
      verified: false,
    },
  ];

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Análise de Usuários
          </h1>
          <p className="text-muted-foreground">
            Métricas e dados dos usuários registrados
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Usuários"
          value={userStats.total.toLocaleString()}
          description="Usuários registrados"
          icon={UsersIcon}
          trend={{
            value:
              ((userStats.thisMonth - userStats.lastMonth) /
                userStats.lastMonth) *
              100,
            isPositive: userStats.thisMonth > userStats.lastMonth,
          }}
        />
        <MetricCard
          title="Novos este Mês"
          value={userStats.thisMonth}
          description="Usuários registrados em fevereiro"
          icon={CalendarIcon}
          trend={{ value: 12.5, isPositive: true }}
        />
        <MetricCard
          title="Email Verificado"
          value={userStats.verified}
          description="Usuários com email verificado"
          icon={CheckCircleIcon}
        />
        <MetricCard
          title="Não Verificados"
          value={userStats.unverified}
          description="Usuários pendentes de verificação"
          icon={ClockIcon}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users-list">Usuários Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <AdminChart
              title="Crescimento Mensal"
              description="Novos usuários por mês"
              data={monthlyGrowthData}
              type="bar"
            />
            <AdminChart
              title="Status de Verificação"
              description="Distribuição por verificação de email"
              data={verificationData}
              type="donut"
            />
          </div>
        </TabsContent>

        <TabsContent value="users-list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Recentes</CardTitle>
              <CardDescription>
                Últimos usuários registrados na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Data de Registro</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.verified ? "default" : "secondary"}
                        >
                          {user.verified ? "Verificado" : "Pendente"}
                        </Badge>
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
