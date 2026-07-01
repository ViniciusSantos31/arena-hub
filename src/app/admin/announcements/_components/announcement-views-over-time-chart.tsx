"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  views: { label: "Visualizações", color: "var(--chart-1)" },
} satisfies ChartConfig;

type AnnouncementViewsOverTimeChartProps = {
  data: Array<{ date: string; views: number }>;
};

export function AnnouncementViewsOverTimeChart({
  data,
}: AnnouncementViewsOverTimeChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
        Sem dados temporais de visualização
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value) => {
            const date = new Date(`${value}T00:00:00`);
            return date.toLocaleDateString("pt-BR", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
          }
        />
        <Bar dataKey="views" fill="var(--color-views)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
