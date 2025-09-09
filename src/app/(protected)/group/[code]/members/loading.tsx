import { Skeleton } from "@/components/ui/skeleton";

export default function GroupMembersLoading() {
  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-8 w-[117px] rounded-md" />
        <div className="w-full overflow-clip rounded-lg border">
          <div className="bg-accent flex h-12 items-center space-x-4 border-b px-4">
            <Skeleton className="bg-card mr-4 h-4 min-w-4 animate-pulse rounded-xs" />
            <Skeleton className="bg-card h-4 w-1/2 max-w-1/2" />
            <Skeleton className="bg-card h-4 w-40" />
            <Skeleton className="bg-card h-4 w-40" />
            <Skeleton className="h-8 min-w-8 bg-transparent" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex h-14 max-h-[53px] items-center space-x-4 border-b px-4 last:border-b-0"
            >
              <Skeleton className="bg-card mr-4 h-4 min-w-4 animate-pulse rounded-xs" />
              <Skeleton className="bg-accent h-4 w-1/2 max-w-1/2" />
              <Skeleton className="bg-accent h-4 w-40" />
              <Skeleton className="bg-accent h-4 w-40" />
              <Skeleton className="bg-accent h-8 min-w-8" />
            </div>
          ))}
        </div>
        <footer className="flex items-center justify-between px-4">
          <Skeleton className="bg-card h-5 w-40" />
          <div className="flex items-center space-x-2">
            <Skeleton className="bg-card h-8 w-8" />
            <Skeleton className="bg-card h-8 w-8" />
          </div>
        </footer>
      </div>
    </div>
  );
}
