import { tutorialStepDropOff } from "@/actions/admin/tutorial";
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
import { TrendingDownIcon } from "lucide-react";

export const TutorialStepDropOffTable = async ({
  className,
}: {
  className?: string;
}) => {
  const result = await tutorialStepDropOff();
  const data = result.data ?? [];

  const topDropOff = [...data]
    .sort((a, b) => b.dropOffRate - a.dropOffRate)
    .slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Drop-off por Passo</CardTitle>
        <CardDescription>
          Usuários que chegaram ao passo mas não o concluíram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {topDropOff.length > 0 && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm font-medium">
              Maiores taxas de abandono
            </p>
            {topDropOff.map((step) => (
              <div key={step.stepId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">
                    <span className="text-muted-foreground">
                      {step.sectionTitle} ·
                    </span>{" "}
                    {step.stepTitle}
                  </span>
                  <span className="text-destructive shrink-0 font-medium">
                    {step.dropOffRate}%
                  </span>
                </div>
                <Progress value={step.dropOffRate} className="h-2" />
              </div>
            ))}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seção</TableHead>
              <TableHead>Passo</TableHead>
              <TableHead>Chegaram</TableHead>
              <TableHead>Concluíram</TableHead>
              <TableHead>Abandonaram</TableHead>
              <TableHead>Taxa de drop-off</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  Nenhum passo ativo encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((step) => (
                <TableRow key={step.stepId}>
                  <TableCell className="font-medium">
                    {step.sectionTitle}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground mr-1">
                      {step.stepOrder}.
                    </span>
                    {step.stepTitle}
                  </TableCell>
                  <TableCell>{step.reached}</TableCell>
                  <TableCell>{step.completed}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <TrendingDownIcon className="text-destructive h-4 w-4" />
                      <span>{step.dropOff}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress
                        value={step.dropOffRate}
                        className="h-2 w-16"
                      />
                      <span className="text-sm">{step.dropOffRate}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
