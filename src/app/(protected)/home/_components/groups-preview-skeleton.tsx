import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompassIcon } from "lucide-react";

export function GroupsPreviewSkeleton() {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-2">
        <div className="space-y-1">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <CompassIcon className="text-primary size-4" />
            Grupos disponíveis
          </h2>
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <div className="flex items-center gap-3 p-4">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-14 rounded-full" />
                </div>
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
              <Skeleton className="size-4 shrink-0" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
