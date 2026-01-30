"use client";

import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  getCategoryColor,
  getCategoryLabel,
} from "./_components/category-utils";
import { tutorialSections } from "./_components/data";
import { TutorialOverview } from "./_components/overview";
import { TutorialContent } from "./_components/tutorial-content";
import { TutorialSidebar } from "./_components/tutorial-sidebar";

export default function LearnMorePage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    new Set(),
  );
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    } else {
      setSelectedSection(sectionId);
    }
  };

  const markAsCompleted = (sectionId: string) => {
    setCompletedSections((prev) => new Set([...prev, sectionId]));
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const progressPercentage =
    (completedSections.size / tutorialSections.length) * 100;

  return (
    <div className="bg-background h-full overflow-y-scroll">
      {/* Header */}
      <div className="bg-card/50 border-b backdrop-blur-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Tutorial Interativo
              </h1>
              <p className="text-muted-foreground mt-2">
                Domine todas as funcionalidades do Arena Hub no seu próprio
                ritmo
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Progresso Geral</div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={progressPercentage} className="w-24" />
                <span className="text-muted-foreground text-sm">
                  {completedSections.size}/{tutorialSections.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Sidebar com categorias */}
          <div className="lg:col-span-1">
            <TutorialSidebar
              sections={tutorialSections}
              selectedSection={selectedSection}
              completedSections={completedSections}
              onToggleSection={toggleSection}
            />
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            {selectedSection ? (
              <TutorialContent
                section={
                  tutorialSections.find((s) => s.id === selectedSection)!
                }
                onComplete={() => markAsCompleted(selectedSection)}
                isCompleted={completedSections.has(selectedSection)}
                expandedSteps={expandedSteps}
                toggleStep={toggleStep}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            ) : (
              <TutorialOverview
                sections={tutorialSections}
                completedSections={completedSections}
                onSelectSection={setSelectedSection}
                getCategoryColor={getCategoryColor}
                getCategoryLabel={getCategoryLabel}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
