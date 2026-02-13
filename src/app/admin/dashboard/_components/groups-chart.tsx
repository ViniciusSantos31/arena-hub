"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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

export const description = "A line chart";

const chartData = [
  { month: "January", group: 186 },
  { month: "February", group: 305 },
  { month: "March", group: 237 },
  { month: "April", group: 73 },
  { month: "May", group: 209 },
  { month: "June", group: 214 },
];

const chartConfig = {
  group: {
    label: "Grupos criados",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type GroupsChartProps = {
  className?: string;
};

export const GroupsChart = ({ className }: GroupsChartProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Crescimento de grupos</CardTitle>
        <CardDescription>Número de grupos criados por mês.</CardDescription>
      </CardHeader>
      <CardContent className="h-full">
        <ChartContainer config={chartConfig} className="min-h-full w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="group"
              type="natural"
              stroke="var(--color-group)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
