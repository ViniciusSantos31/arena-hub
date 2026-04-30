import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  GraduationCapIcon,
  KeyRoundIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import Link from "next/link";

type ShortcutIcon = "plus" | "search" | "graduation" | "key";

type ShortcutAccent = "primary" | "emerald" | "violet" | "amber";

const accentClasses: Record<ShortcutAccent, string> = {
  primary:
    "bg-primary/10 text-primary group-hover:bg-primary/15 ring-primary/15",
  emerald:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/15 ring-emerald-500/15",
  violet:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 group-hover:bg-violet-500/15 ring-violet-500/15",
  amber:
    "bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:bg-amber-500/15 ring-amber-500/15 ",
};

const accentBorderClasses: Record<ShortcutAccent, string> = {
  primary: "hover:border-primary/50",
  emerald: "hover:border-emerald-500/50",
  violet: "hover:border-violet-500/50",
  amber: "hover:border-amber-500/50",
};

function getIcon(icon: ShortcutIcon) {
  switch (icon) {
    case "plus":
      return PlusIcon;
    case "search":
      return SearchIcon;
    case "graduation":
      return GraduationCapIcon;
    case "key":
      return KeyRoundIcon;
  }
}

export function ShortcutTile({
  title,
  description,
  href,
  icon,
  accent = "primary",
  compact = false,
}: {
  title: string;
  description: string;
  href: string;
  icon: ShortcutIcon;
  accent?: ShortcutAccent;
  compact?: boolean;
}) {
  const Icon = getIcon(icon);

  return (
    <Link href={href} className="group outline-none">
      <Card
        className={cn(
          "border-border/60 hover:border-primary/25 hover:bg-primary/5 transition-colors",
          compact ? "gap-0 px-0 py-0" : "gap-0 px-0 py-0",
          accentBorderClasses[accent],
        )}
      >
        <div
          className={cn(
            "flex h-full w-full items-start gap-3 p-4",
            compact && "p-3",
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors",
              compact && "h-10 w-10 rounded-lg",
              accentClasses[accent],
            )}
          >
            <Icon className={cn("h-5 w-5", compact && "h-4 w-4")} />
          </div>

          <div className={cn("w-fit min-w-0 flex-1", compact && "h-10")}>
            <div className={cn("text-sm font-semibold", compact && "text-sm")}>
              {title}
            </div>
            <div
              className={cn(
                "text-muted-foreground mt-0.5 text-xs leading-relaxed",
                compact && "line-clamp-1",
              )}
            >
              {description}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
