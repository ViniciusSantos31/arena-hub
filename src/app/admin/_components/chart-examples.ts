// Exemplos de configuração para os gráficos do admin
export const chartExamples = {
  // Configuração para gráfico de barras simples
  barChartConfig: {
    title: "Usuários por Mês",
    description: "Crescimento mensal de usuários",
    data: [
      { label: "Jan", value: 120, color: "hsl(var(--chart-1))" },
      { label: "Fev", value: 180, color: "hsl(var(--chart-2))" },
      { label: "Mar", value: 250, color: "hsl(var(--chart-3))" },
      { label: "Abr", value: 300, color: "hsl(var(--chart-4))" },
      { label: "Mai", value: 420, color: "hsl(var(--chart-5))" },
    ],
    type: "bar" as const,
  },

  // Configuração para gráfico de pizza/donut
  pieChartConfig: {
    title: "Status dos Usuários",
    description: "Distribuição por status de atividade",
    data: [
      { label: "Ativos", value: 850, color: "hsl(142, 76%, 36%)" },
      { label: "Inativos", value: 250, color: "hsl(0, 84%, 60%)" },
      { label: "Novos", value: 150, color: "hsl(48, 96%, 53%)" },
      { label: "Suspensos", value: 50, color: "hsl(357, 87%, 47%)" },
    ],
    type: "donut" as const,
  },

  // Configuração para gráfico de linha
  lineChartConfig: {
    title: "Engajamento Diário",
    description: "Atividade dos usuários ao longo da semana",
    data: [
      { label: "Dom", value: 45 },
      { label: "Seg", value: 85 },
      { label: "Ter", value: 92 },
      { label: "Qua", value: 78 },
      { label: "Qui", value: 95 },
      { label: "Sex", value: 110 },
      { label: "Sáb", value: 120 },
    ],
    type: "line" as const,
  },

  // Exemplo para métricas simples com barras horizontais
  metricChartConfig: {
    title: "Performance por Categoria",
    description: "Uso das funcionalidades principais",
    data: [
      { label: "Chat", value: 85 },
      { label: "Partidas", value: 72 },
      { label: "Grupos", value: 65 },
      { label: "Tutorial", value: 95 },
      { label: "Perfil", value: 45 },
    ],
  },
};

// Cores padrão para os gráficos
export const chartColors = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  accent: "hsl(var(--chart-3))",
  warning: "hsl(var(--chart-4))",
  success: "hsl(var(--chart-5))",

  // Cores semânticas
  active: "hsl(142, 76%, 36%)",
  inactive: "hsl(0, 84%, 60%)",
  pending: "hsl(48, 96%, 53%)",
  error: "hsl(357, 87%, 47%)",
  info: "hsl(217, 91%, 60%)",
};

// Utilitário para gerar dados de exemplo
export function generateMockData(count: number, prefix: string = "Item") {
  return Array.from({ length: count }, (_, i) => ({
    label: `${prefix} ${i + 1}`,
    value: Math.floor(Math.random() * 100) + 10,
  }));
}

// Utilitário para gerar dados temporais
export function generateTimeSeriesData(days: number = 30) {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      label: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }),
      value: Math.floor(Math.random() * 100) + 20,
    };
  });
}
