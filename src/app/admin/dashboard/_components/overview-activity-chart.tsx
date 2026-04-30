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

const chartConfig = {
  users: { label: "Usuários", color: "var(--chart-2)" },
  groups: { label: "Grupos", color: "var(--chart-3)" },
  matches: { label: "Partidas", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function OverviewActivityChart({
  className,
  data,
}: {
  className?: string;
  data: Array<{ date: string; users: number; groups: number; matches: number }>;
}) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("users");

  const total = React.useMemo(
    () => ({
      users: data.reduce((acc, curr) => acc + curr.users, 0),
      groups: data.reduce((acc, curr) => acc + curr.groups, 0),
      matches: data.reduce((acc, curr) => acc + curr.matches, 0),
    }),
    [data],
  );

  return (
    <Card className={cn("h-full py-0", className)}>
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle>Atividade (30 dias)</CardTitle>
          <CardDescription>
            Criações por dia (usuários, grupos e partidas)
          </CardDescription>
        </div>
        <div className="flex">
          {(["users", "groups", "matches"] as const).map((key) => (
            <button
              key={key}
              data-active={activeChart === key}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setActiveChart(key)}
              type="button"
            >
              <span className="text-muted-foreground text-xs">
                {chartConfig[key].label}
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {total[key].toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="w-full">
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
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
                  className="w-[220px]"
                  nameKey={activeChart}
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

