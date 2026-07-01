import { Skeleton } from "@/components/ui/skeleton";

export function GroupsCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-9 w-full md:max-w-sm" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-xl border border-border/60 p-6"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-3 w-24" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Skeleton className="h-[92px] w-full rounded-md" />
              <Skeleton className="h-[92px] w-full rounded-md" />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>

            <div className="mt-5">
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

