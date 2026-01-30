import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ChevronRight } from "lucide-react";
import { TutorialSection } from "./types";

interface SectionCardProps {
  section: TutorialSection;
  isCompleted: boolean;
  onSelect: (sectionId: string) => void;
  getCategoryColor: (category: string) => string;
  getCategoryLabel: (category: string) => string;
}

export function SectionCard({
  section,
  isCompleted,
  onSelect,
  getCategoryColor,
  getCategoryLabel,
}: SectionCardProps) {
  return (
    <Card
      className={`h-full cursor-pointer transition-all hover:shadow-lg ${
        isCompleted ? "ring-2 ring-green-200 dark:ring-green-800" : ""
      }`}
      onClick={() => onSelect(section.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isCompleted ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <section.icon className="text-primary h-6 w-6" />
            )}
            <div>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={getCategoryColor(section.category)}
                >
                  {getCategoryLabel(section.category)}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  {section.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="text-muted-foreground h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{section.description}</p>
        <div className="text-muted-foreground mt-3 text-xs">
          {section.steps.length} passos incluídos
        </div>
      </CardContent>
    </Card>
  );
}
