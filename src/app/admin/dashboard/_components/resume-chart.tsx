"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

export const description =
  "Este gráfico apresenta uma visão geral da atividade dos usuários e das partidas criadas no último mês. Ele permite comparar o número total de usuários e partidas, bem como acompanhar a evolução diária dessas métricas ao longo do tempo. Use os botões acima para alternar entre as visualizações de usuários e partidas, e passe o mouse sobre os pontos do gráfico para obter detalhes específicos de cada dia.";

const chartConfig = {
  users: {
    label: "Usuários",
    color: "var(--chart-2)",
  },
  matches: {
    label: "Partidas",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type ResumeChartProps = {
  className?: string;
  data: {
    date: string;
    users: number;
    matches: number;
  }[];
};

export const ResumeChart = ({ className, data }: ResumeChartProps) => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("users");

  const total = React.useMemo(
    () => ({
      users: data.reduce((acc, curr) => acc + curr.users, 0),
      matches: data.reduce((acc, curr) => acc + curr.matches, 0),
    }),
    [data],
  );

  return (
    <Card className={cn("h-full py-0", className)}>
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Resumo de Atividade</CardTitle>
          <CardDescription>
            Visão geral dos usuários e partidas criados nos últimos 3 meses
          </CardDescription>
        </div>
        <div className="flex">
          {["users", "matches"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  nameKey={activeChart}
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
