import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { TutorialSectionWithSteps } from "@/db/schema/tutorial";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { getCategoryColor, getCategoryLabel } from "./category-utils";

interface TutorialSidebarProps {
  sections: TutorialSectionWithSteps[];
  selectedSectionId: string | null;
  onSectionSelect: (sectionId: string) => void;
  isSectionCompleted: (sectionId: string) => boolean;
  getCompletedSteps: (sectionId: string) => number;
}

export function TutorialSidebar({
  sections,
  selectedSectionId,
  onSectionSelect,
  isSectionCompleted,
  getCompletedSteps,
}: TutorialSidebarProps) {
  return (
    <div className="bg-background flex h-full flex-1 flex-col overflow-y-hidden">
      <div className="bg-background sticky top-0 z-10 border-b p-4">
        <h2 className="text-foreground font-semibold">Índice do Tutorial</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {sections.length} seções disponíveis
        </p>
      </div>

      <div className="flex w-full flex-1 flex-col space-y-3 overflow-y-auto p-4">
        {sections.map((section) => {
          const isSelected = section.id === selectedSectionId;
          const completed = isSectionCompleted(section.id);
          const completedSteps = getCompletedSteps(section.id);
          const totalSteps = section.steps.length;
          const progressPercentage =
            totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

          // Buscar o ícone dinamicamente
          const IconComponent =
            (LucideIcons as unknown as Record<string, React.ComponentType>)[
              section.icon
            ] || LucideIcons.BookOpen;

          return (
            <button
              key={section.id}
              id={`learn-more-section-${section.id}`}
              onClick={() => onSectionSelect(section.id)}
              className={cn(
                "w-full rounded-lg border p-4 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-background hover:bg-muted/50",
                "group",
              )}
            >
              <div className="mb-3 flex items-start gap-3">
                <div
                  className={cn(
                    "shrink-0 rounded-md p-2",
                    getCategoryColor(section.category),
                  )}
                >
                  <IconComponent />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-foreground group-hover:text-primary line-clamp-2 text-sm font-medium transition-colors">
                      {section.title}
                    </h3>
                    {completed && (
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    )}
                  </div>

                  <div className="mt-1 mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryLabel(section.category)}
                    </Badge>
                    {section.estimatedTime && (
                      <span className="text-muted-foreground text-xs">
                        {section.estimatedTime}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>Progresso</span>
                  <span>
                    {completedSteps}/{totalSteps} passos
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
