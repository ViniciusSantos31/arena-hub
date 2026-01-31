import {
  markSectionAsCompleted,
  markStepAsCompleted,
} from "@/actions/tutorial/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { TutorialSectionWithSteps } from "@/db/schema/tutorial";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { CheckCircle2, ChevronRight, Circle, Clock } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { toast } from "sonner";
import { getCategoryColor, getCategoryLabel } from "./category-utils";

interface TutorialContentProps {
  section: TutorialSectionWithSteps;
  selectedStepIndex: number;
  onStepSelect: (index: number) => void;
  isStepCompleted: (sectionId: string, stepId: string) => boolean;
  onProgressUpdate: () => void;
  setNextSelectedSection: () => void;
}

export function TutorialContent({
  section,
  selectedStepIndex,
  onStepSelect,
  isStepCompleted,
  onProgressUpdate,
  setNextSelectedSection,
}: TutorialContentProps) {
  const { execute: markSectionComplete } = useAction(markSectionAsCompleted, {
    onSuccess: () => {
      onProgressUpdate();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao marcar seção como concluída");
    },
  });

  const { execute: markStepComplete } = useAction(markStepAsCompleted, {
    onSuccess: () => {
      onProgressUpdate();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Erro ao marcar passo como concluído");
    },
  });

  const currentStep = section.steps[selectedStepIndex];
  const completedSteps = section.steps.filter((step) =>
    isStepCompleted(section.id, step.id),
  ).length;
  const progressPercentage = (completedSteps / section.steps.length) * 100;

  const handleMarkStepComplete = () => {
    if (currentStep && !isStepCompleted(section.id, currentStep.id)) {
      markStepComplete({ sectionId: section.id, stepId: currentStep.id });
    }
    handleNextStep();
  };

  const handleNextStep = () => {
    if (selectedStepIndex < section.steps.length - 1) {
      onStepSelect(selectedStepIndex + 1);
    }
  };

  const handleMarkSectionComplete = () => {
    markSectionComplete({ sectionId: section.id });
  };
  const handleNextSection = () => {
    handleMarkStepComplete();
    handleMarkSectionComplete();
    setNextSelectedSection();
  };

  // Buscar o ícone dinamicamente
  const IconComponent =
    (LucideIcons as unknown as Record<string, React.ComponentType>)[
      section.icon
    ] || LucideIcons.BookOpen;

  return (
    <div className="flex h-full flex-col">
      {/* Header da Seção */}
      <div className="bg-background sticky top-0 z-10 border-b p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                "rounded-lg p-3",
                getCategoryColor(section.category),
              )}
            >
              <IconComponent />
            </div>
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-foreground text-2xl font-bold">
                  {section.title}
                </h1>
                <Badge variant="secondary">
                  {getCategoryLabel(section.category)}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">
                {section.description}
              </p>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {section.estimatedTime}
                </div>
                <div>
                  {completedSteps} de {section.steps.length} passos completos
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={progressPercentage} className="w-full" />
        </div>
      </div>

      <div className="flex h-full flex-col lg:flex-row">
        {/* Lista de Passos */}
        <div className="bg-muted/50 flex w-full flex-col border-r lg:w-72">
          <div className="flex h-full flex-col p-4 lg:w-72">
            <h3 className="text-foreground mb-4 font-semibold">
              Passos ({section.steps.length})
            </h3>
            <div className="flex w-full flex-col space-y-2">
              {section.steps.map((step, index) => {
                const completed = isStepCompleted(section.id, step.id);
                const isSelected = index === selectedStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => onStepSelect(index)}
                    className={cn(
                      "w-full flex-1 rounded-lg border p-2.5 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:bg-muted/50",
                      "group",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {completed ? (
                        <CheckCircle2 className="text-primary h-5 w-5 shrink-0" />
                      ) : (
                        <Circle className="text-muted-foreground h-5 w-5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground group-hover:text-primary text-sm font-medium transition-colors">
                          {index + 1}. {step.title}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conteúdo do Passo */}
        <div className="py-6 lg:min-h-full">
          {currentStep && (
            <div className="flex flex-col lg:h-full">
              <div className="mb-6 flex flex-col gap-3 px-6">
                {isStepCompleted(section.id, currentStep.id) && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 className="h-3 w-3" />
                    Concluído
                  </Badge>
                )}
                <span className="text-primary bg-primary/10 w-fit rounded px-2 py-1 text-sm font-medium">
                  Passo {selectedStepIndex + 1} de {section.steps.length}
                </span>
              </div>

              <h2 className="text-foreground mb-4 px-6 text-xl font-semibold">
                {currentStep.title}
              </h2>

              <div className="prose prose-neutral dark:prose-invert mb-8 max-w-none px-6 lg:h-full">
                <div
                  dangerouslySetInnerHTML={{ __html: currentStep.content }}
                />
                {currentStep.actionButtonText &&
                  currentStep.actionButtonHref && (
                    <Button variant="outline" asChild className="mt-4">
                      <Link href={currentStep.actionButtonHref} target="_blank">
                        {currentStep.actionButtonText}
                      </Link>
                    </Button>
                  )}
              </div>

              <div className="mt-auto flex items-center justify-between border-t px-6 pt-6">
                {selectedStepIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => onStepSelect(selectedStepIndex - 1)}
                  >
                    <LucideIcons.ChevronLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                )}

                {selectedStepIndex < section.steps.length - 1 && (
                  <Button onClick={handleMarkStepComplete} className="ml-auto">
                    Próximo passo
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
                {selectedStepIndex === section.steps.length - 1 && (
                  <Button onClick={handleNextSection}>
                    Próxima seção
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
