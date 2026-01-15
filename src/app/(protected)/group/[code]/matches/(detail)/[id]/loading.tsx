export default function MatchDetailLoading() {
  return (
    <main className="flex flex-col gap-4">
      {/* Back button skeleton */}
      <div className="bg-muted h-6 w-48 animate-pulse rounded"></div>

      {/* Main card skeleton */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex flex-1 items-center gap-2">
            <div className="bg-muted h-10 w-10 animate-pulse rounded-lg"></div>
            <div className="flex flex-col justify-center gap-2">
              <div className="bg-muted h-6 w-48 animate-pulse rounded"></div>
              <div className="bg-muted h-4 w-64 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="ml-auto">
            <div className="bg-muted h-6 w-32 animate-pulse rounded-full"></div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <div className="bg-muted h-5 w-16 animate-pulse rounded"></div>
              <div className="bg-muted mt-1 h-4 w-32 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="mb-4 w-full">
            <div className="bg-muted h-1 w-full animate-pulse rounded"></div>
          </div>
        </div>

        <div className="flex items-center space-x-2 border-t p-6">
          <div className="bg-muted h-10 flex-1 animate-pulse rounded-md @md:w-48 @md:flex-none"></div>
          <div className="ml-auto flex gap-2">
            <div className="bg-muted hidden h-10 w-36 animate-pulse rounded-md @sm:block"></div>
            <div className="bg-muted h-10 w-10 animate-pulse rounded-md"></div>
          </div>
        </div>
      </div>

      {/* Players card skeleton */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-muted h-10 w-10 animate-pulse rounded-lg"></div>
            <div className="bg-muted h-6 w-44 animate-pulse rounded"></div>
          </div>
        </div>

        <div className="space-y-4 p-6 pt-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-muted h-10 w-10 animate-pulse rounded-full"></div>
                <div className="bg-muted h-5 w-32 animate-pulse rounded"></div>
              </div>
              <div className="bg-muted h-4 w-12 animate-pulse rounded"></div>
            </div>
          ))}
        </div>

        <div className="relative flex items-center py-4">
          <div className="border-muted-foreground/30 flex-1 border-t border-dashed"></div>
          <div className="bg-card text-muted-foreground px-4 text-xs">
            Lista de Espera
          </div>
          <div className="border-muted-foreground/30 flex-1 border-t border-dashed"></div>
        </div>
      </div>
    </main>
  );
}
