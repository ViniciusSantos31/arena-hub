import { LucideIcon } from "lucide-react";

export function CreateMatchAccordionTitle({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="text-primary h-6 w-6" />
      <div className="text-start">
        <h3 className="font-bold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}
