import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { TutorialStep } from "./tutorial-step";
import { TutorialSection } from "./types";

interface TutorialContentProps {
  section: TutorialSection;
  onComplete: () => void;
  isCompleted: boolean;
  expandedSteps: Set<string>;
  toggleStep: (stepId: string) => void;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
}

export function TutorialContent({
  section,
  onComplete,
  isCompleted,
  expandedSteps,
  toggleStep,
  getCategoryColor,
  getCategoryLabel,
}: TutorialContentProps) {
  return (
    <div className="space-y-4">
      {/* Section Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <section.icon className="text-primary h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
                <CardDescription className="mt-1">
                  {section.description}
                </CardDescription>
                <div className="mt-2 flex items-center gap-3">
                  <Badge className={getCategoryColor(section.category)}>
                    {getCategoryLabel(section.category)}
                  </Badge>
                  <span className="text-muted-foreground text-sm">
                    {section.estimatedTime}
                  </span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">
                    {section.steps.length} passos
                  </span>
                </div>
              </div>
            </div>
            {isCompleted && <CheckCircle className="text-primary/50 h-8 w-8" />}
          </div>
        </CardHeader>
      </Card>

      {/* Steps */}
      <Accordion type="multiple" className="space-y-4">
        {section.steps.map((step, index) => {
          const stepId = `${section.id}-step-${index}`;
          const isExpanded = expandedSteps.has(stepId);

          return (
            <TutorialStep
              key={index}
              step={step}
              stepNumber={index + 1}
              stepId={stepId}
              isExpanded={isExpanded}
              onToggle={toggleStep}
            />
          );
        })}
      </Accordion>

      {/* Complete Section Button */}
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <span className="font-medium">Seção concluída!</span>
            </div>
          ) : (
            <Button onClick={onComplete} size="lg">
              <CheckCircle className="h-5 w-5" />
              Marcar como Concluída
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
