import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TutorialSectionWithSteps } from "@/db/schema/tutorial";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { ProgressStats } from "./progress-stats";
import { SectionCard } from "./section-card";

interface TutorialOverviewProps {
  sections: TutorialSectionWithSteps[];
  completedSections: Set<string>;
  onSelectSection: () => void;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
}

export function TutorialOverview({
  sections,
  completedSections,
  onSelectSection,
  getCategoryColor,
  getCategoryLabel,
}: TutorialOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Welcome Section */}
      <Card className="border-primary/20 from-primary/5 to-background bg-gradient-to-br">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <PlayCircle className="text-primary h-6 w-6" />
            Bem-vindo ao Tutorial do Arena Hub
          </CardTitle>
          <CardDescription>
            Explore todos os recursos da plataforma através deste guia
            interativo. Escolha um tópico abaixo para começar ou siga a
            sequência recomendada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/home">
                <ArrowRight className="h-4 w-4" />
                Ir para Dashboard
              </Link>
            </Button>
            <Button variant="outline">Começar Tutorial</Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <ProgressStats
        sections={sections}
        completedSections={completedSections}
      />

      {/* Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            isCompleted={completedSections.has(section.id)}
            onSelect={onSelectSection}
            completedSteps={
              section.steps.filter((step) => completedSections.has(step.id))
                .length
            }
            totalSteps={section.steps.length}
          />
        ))}
      </div>
    </div>
  );
}
