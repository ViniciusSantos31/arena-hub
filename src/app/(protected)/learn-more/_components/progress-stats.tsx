import { Card, CardContent } from "@/components/ui/card";
import { TutorialSectionWithSteps } from "@/db/schema/tutorial";
import { BookOpen, CheckCircle, Zap } from "lucide-react";

interface ProgressStatsProps {
  sections: TutorialSectionWithSteps[];
  completedSections: Set<string>;
}

export function ProgressStats({
  sections,
  completedSections,
}: ProgressStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-2xl font-bold">{sections.length}</div>
              <div className="text-muted-foreground text-sm">
                Seções Disponíveis
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{completedSections.size}</div>
              <div className="text-muted-foreground text-sm">Concluídas</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-2xl font-bold">
                {sections.reduce(
                  (acc, section) => acc + parseInt(section.estimatedTime),
                  0,
                )}{" "}
                min
              </div>
              <div className="text-muted-foreground text-sm">Tempo Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
