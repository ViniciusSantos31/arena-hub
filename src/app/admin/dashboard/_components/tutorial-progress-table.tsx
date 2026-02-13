import { tutorialSectionProgress } from "@/actions/admin/tutorial";
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
import { CheckCircleIcon, ClockIcon, XCircleIcon } from "lucide-react";

export const TutorialProgressTable = async ({
  className,
}: {
  className?: string;
}) => {
  const tutorial = await tutorialSectionProgress();

  const data = tutorial.data || [];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Progresso por Seção</CardTitle>
        <CardDescription>
          Detalhamento do progresso de cada seção do tutorial
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seção</TableHead>
              <TableHead>Não iniciado</TableHead>
              <TableHead>Em Progresso</TableHead>
              <TableHead>Concluídos</TableHead>
              <TableHead>Taxa de Conclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((section) => (
              <TableRow key={section.title}>
                <TableCell className="font-medium">{section.title}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-4 w-4 text-red-600" />
                    <span>{section.notStarted}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-yellow-600" />
                    <span>{section.inProgress}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span>{section.completed}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress
                      value={section.completionRate}
                      className="h-2 w-16"
                    />
                    <span className="text-sm">{section.completionRate}%</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
