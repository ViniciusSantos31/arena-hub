import { cn } from "@/lib/utils";
import { ArrowRightIcon, LucideIcon } from "lucide-react";
import Link from "next/link";
import { ComponentProps } from "react";

type GroupButtonProps = ComponentProps<"button"> & {
  label: string;
  icon: LucideIcon;
  href: string;
  description?: string;
};

export const GroupButton = ({
  label,
  icon: Icon,
  href,
  className,
  description,
}: GroupButtonProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "group bg-card border-border/60 hover:border-primary/30 hover:bg-primary/5 flex w-full cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all duration-200",
        className,
      )}
    >
      <div className="bg-primary/10 group-hover:bg-primary/15 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors">
        <Icon className="text-primary size-5" />
      </div>
      <div className="flex-1">
        <span className="text-foreground block text-sm font-semibold">{label}</span>
        {description && (
          <span className="text-muted-foreground block text-xs">{description}</span>
        )}
      </div>
      <ArrowRightIcon className="text-muted-foreground/50 group-hover:text-primary size-4 transition-colors" />
    </Link>
  );
};
