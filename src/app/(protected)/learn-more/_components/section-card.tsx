import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { TutorialSectionWithSteps } from "@/db/schema/tutorial";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { getCategoryColor, getCategoryLabel } from "./category-utils";

interface SectionCardProps {
  section: TutorialSectionWithSteps;
  isCompleted: boolean;
  completedSteps: number;
  totalSteps: number;
  onSelect: () => void;
}

export function SectionCard({
  section,
  isCompleted,
  completedSteps,
  totalSteps,
  onSelect,
}: SectionCardProps) {
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Buscar o ícone dinamicamente
  const IconComponent =
    (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[
      section.icon
    ] || LucideIcons.BookOpen;

  return (
    <Card
      className={cn(
        "group h-full cursor-pointer transition-all hover:shadow-lg",
        isCompleted && "ring-primary/20 ring-2",
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div
              className={cn(
                "shrink-0 rounded-lg p-2",
                getCategoryColor(section.category),
              )}
            >
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="group-hover:text-primary line-clamp-2 text-lg transition-colors">
                {section.title}
              </CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(section.category)}
                </Badge>
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {section.estimatedTime}
                </div>
              </div>
            </div>
          </div>
          {isCompleted && (
            <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {section.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">
              {completedSteps}/{totalSteps} passos
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          {progressPercentage === 100 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              Seção concluída
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground text-xs">
            {totalSteps} passos total
          </span>
          <ChevronRight className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
