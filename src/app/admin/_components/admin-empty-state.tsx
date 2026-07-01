import type { ReactNode } from "react";

export type AdminEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminEmptyState({
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
      <h3 className="text-sm font-medium">{title}</h3>
      {description ? (
        <p className="text-muted-foreground mt-1 max-w-sm text-xs">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
