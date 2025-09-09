import { Skeleton } from "@/components/ui/skeleton";

export default function GroupDashboardLoading() {
  return (
    <main className="grid w-full gap-4 @2xl:grid-cols-2">
      <div className="bg-card text-card-foreground h-fit rounded-lg border shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="hidden md:flex">
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
        <div className="p-6 pt-0">
          <div className="flex w-full flex-wrap gap-5">
            <div className="flex flex-col">
              <Skeleton className="mb-1 h-6 w-8" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex flex-col">
              <Skeleton className="mb-1 h-6 w-8" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <div className="flex items-center p-6 pt-0 md:hidden">
          <Skeleton className="ml-auto h-8 w-24" />
        </div>
      </div>

      <section className="flex w-full flex-1 flex-wrap gap-4">
        <div className="bg-card text-card-foreground h-fit w-full rounded-lg border shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="hidden md:flex">
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="flex w-full flex-wrap gap-5">
              <div className="flex flex-col">
                <Skeleton className="mb-1 h-6 w-8" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex flex-col">
                <Skeleton className="mb-1 h-6 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
          <div className="flex items-center p-6 pt-0 md:hidden">
            <Skeleton className="ml-auto h-8 w-24" />
          </div>
        </div>

        <div className="bg-card text-card-foreground w-full rounded-lg border shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="hidden md:flex">
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <ul className="space-y-2">
              <li className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-6" />
              </li>
              <li className="flex items-center justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-6" />
              </li>
            </ul>
          </div>
          <div className="flex items-center p-6 pt-0 md:hidden">
            <Skeleton className="ml-auto h-8 w-32" />
          </div>
        </div>
      </section>
    </main>
  );
}
