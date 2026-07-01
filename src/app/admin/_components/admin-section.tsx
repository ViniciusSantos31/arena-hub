import { cn } from "@/lib/utils";

interface AdminSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function AdminSection({
  title,
  description,
  action,
  children,
  className,
  id,
}: AdminSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn("space-y-4", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-0.5">
          <h2
            id={id ? `${id}-heading` : undefined}
            className="text-base font-semibold tracking-tight"
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
