import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { TutorialStep as ITutorialStep } from "./types";

interface TutorialStepProps {
  step: ITutorialStep;
  stepNumber: number;
  stepId: string;
  isExpanded: boolean;
  onToggle: (stepId: string) => void;
}

export function TutorialStep({ step, stepNumber, stepId }: TutorialStepProps) {
  return (
    <AccordionItem
      value={stepId}
      className="w-full rounded-lg border p-4 transition-all last:border-b"
    >
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
            {stepNumber}
          </div>
          <CardTitle className="text-lg">{step.title}</CardTitle>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {step.content}
        </p>
        {step.actionButton && (
          <Button asChild variant="outline">
            <Link href={step.actionButton.href}>
              {step.actionButton.text}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}
