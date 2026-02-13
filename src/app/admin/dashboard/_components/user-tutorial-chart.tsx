"use client";

import { Pie, PieChart } from "recharts";

import { getTutorialOverallStats } from "@/actions/admin/tutorial";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export const description = "A donut chart";

const chartConfig = {
  notStarted: {
    label: "Não iniciado",
    color: "var(--muted)",
  },
  inProgress: {
    label: "Em progresso",
    color: "var(--chart-3)",
  },
  completed: {
    label: "Concluído",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const UserTutorialChart = ({
  data,
}: {
  data: Awaited<ReturnType<typeof getTutorialOverallStats>>["data"];
}) => {
  const tutorialStats = data || {
    notStarted: 0,
    inProgress: 0,
    completed: 0,
  };

  const chartData = [
    {
      status: "notStarted",
      users: tutorialStats.notStarted,
      fill: "var(--color-notStarted)",
    },
    {
      status: "inProgress",
      users: tutorialStats.inProgress,
      fill: "var(--color-inProgress)",
    },
    {
      status: "completed",
      users: tutorialStats.completed,
      fill: "var(--color-completed)",
    },
  ];

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Progresso do Tutorial</CardTitle>
        <CardDescription>
          Distribuição do progresso dos usuários no tutorial
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-foreground mx-auto aspect-square"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="users" nameKey="status" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap items-center space-x-4">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center space-x-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span className="flex-1 text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};
