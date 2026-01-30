export interface TutorialSection {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: "basic" | "intermediate" | "advanced";
  estimatedTime: string;
  steps: TutorialStep[];
}

export interface TutorialStep {
  title: string;
  content: string;
  actionButton?: {
    text: string;
    href: string;
  };
}

export type CategoryType = "basic" | "intermediate" | "advanced";
