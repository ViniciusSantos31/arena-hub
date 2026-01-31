"use client";

import {
  getTutorialSections,
  getUserTutorialProgress,
} from "@/actions/tutorial/progress";
import { LoadingPage } from "@/components/loading-page";
import type { TutorialSectionWithSteps } from "@/db/schema/tutorial";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { TutorialContent } from "./_components/content";
import { SectionCard } from "./_components/section-card";
import { TutorialSidebar } from "./_components/sidebar";
import { useSectionsSidebar } from "./_hooks/use-sections-sidebar";

interface UserProgress {
  sectionId: string;
  stepId?: string | null;
  isCompleted: boolean;
  completedAt?: Date | null;
}

export default function LearnMorePage() {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);
  const [sections, setSections] = useState<TutorialSectionWithSteps[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const { isOpen, setIsOpen } = useSectionsSidebar();

  const { execute: loadSections, status: sectionsStatus } = useAction(
    getTutorialSections,
    {
      onSuccess: ({ data }) => {
        if (data) {
          setSections(data);
          if (data.length > 0 && !selectedSectionId) {
            setSelectedSectionId(data[0].id);
          }
        }
      },
    },
  );

  const { execute: loadProgress } = useAction(getUserTutorialProgress, {
    onSuccess: ({ data }) => {
      if (data) {
        setUserProgress(
          data.map((p) => ({
            sectionId: p.sectionId,
            stepId: p.stepId,
            isCompleted: p.isCompleted,
            completedAt: p.completedAt,
          })),
        );
      }
    },
  });

  useEffect(() => {
    loadSections();
    loadProgress();
  }, [loadSections, loadProgress]);

  // Helper functions to check progress
  const isSectionCompleted = (sectionId: string) =>
    userProgress.some(
      (p) => p.sectionId === sectionId && !p.stepId && p.isCompleted,
    );

  const isStepCompleted = (sectionId: string, stepId: string) =>
    userProgress.some(
      (p) => p.sectionId === sectionId && p.stepId === stepId && p.isCompleted,
    );

  const getCompletedSteps = (sectionId: string) =>
    userProgress.filter(
      (p) => p.sectionId === sectionId && p.stepId && p.isCompleted,
    ).length;

  const selectedSection = sections.find(
    (section) => section.id === selectedSectionId,
  );

  const refreshData = () => {
    const contentScrollable = document.getElementById("scroll-to-here");
    if (contentScrollable)
      contentScrollable.scrollIntoView({ behavior: "smooth" });
    loadProgress();
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsOpen(false);
  };

  const handleSetNextSelectedSection = () => {
    if (selectedSectionId) {
      const currentIndex = sections.findIndex(
        (section) => section.id === selectedSectionId,
      );
      if (currentIndex >= 0 && currentIndex < sections.length - 1) {
        const nextSectionId = sections[currentIndex + 1].id;
        setSelectedSectionId(nextSectionId);
        setSelectedStepIndex(0);
        const sectionElement = document.getElementById(
          `learn-more-section-${nextSectionId}`,
        );
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  };

  if (sectionsStatus === "executing" || sections.length === 0) {
    return <LoadingPage />;
  }

  return (
    <div className="flex max-h-full min-h-0 flex-1 flex-col overflow-y-hidden scroll-smooth">
      {/* Header */}
      <div className="bg-background min-h-px w-full" id="scroll-to-here" />

      {/* Content */}
      <div
        className="relative flex flex-1 overflow-y-hidden"
        id="content-scrollable"
      >
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`bg-background fixed inset-y-0 left-0 z-50 w-80 transform border-r transition-transform duration-300 ease-in-out md:relative md:z-auto md:translate-x-0 lg:w-fit ${isOpen ? "translate-x-0" : "-translate-x-full"} `}
        >
          <div className="h-full w-xs overflow-y-auto md:pt-0">
            <TutorialSidebar
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSectionSelect={handleSectionSelect}
              isSectionCompleted={isSectionCompleted}
              getCompletedSteps={getCompletedSteps}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="bg-muted/30 flex h-full overflow-x-hidden">
          {selectedSection ? (
            <TutorialContent
              section={selectedSection}
              selectedStepIndex={selectedStepIndex}
              onStepSelect={setSelectedStepIndex}
              isStepCompleted={isStepCompleted}
              onProgressUpdate={refreshData}
              setNextSelectedSection={handleSetNextSelectedSection}
            />
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-4xl">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      isCompleted={isSectionCompleted(section.id)}
                      completedSteps={getCompletedSteps(section.id)}
                      totalSteps={section.steps.length}
                      onSelect={() => setSelectedSectionId(section.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
