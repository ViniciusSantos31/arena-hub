"use client";

import { CheckCircle } from "lucide-react";
import { TutorialSection } from "./types";

interface TutorialSidebarProps {
  sections: TutorialSection[];
  selectedSection: string | null;
  completedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
}

export function TutorialSidebar({
  sections,
  selectedSection,
  completedSections,
  onToggleSection,
}: TutorialSidebarProps) {
  return (
    <div className="sticky top-6 flex">
      <SectionList
        sections={sections}
        selectedSection={selectedSection}
        completedSections={completedSections}
        onToggleSection={onToggleSection}
      />
    </div>
  );
}

interface SectionListProps {
  sections: TutorialSection[];
  selectedSection: string | null;
  completedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
}

function SectionList({
  sections,
  selectedSection,
  completedSections,
  onToggleSection,
}: SectionListProps) {
  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onToggleSection(section.id)}
          className={`hover:bg-accent w-full rounded-lg border p-3 text-left transition-colors ${
            selectedSection === section.id
              ? "border-primary bg-primary/5"
              : "border-border"
          }`}
        >
          <div className="flex items-center gap-3">
            {completedSections.has(section.id) ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <section.icon className="text-muted-foreground h-5 w-5" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {section.title}
              </div>
              <div className="text-muted-foreground text-xs">
                {section.estimatedTime}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
