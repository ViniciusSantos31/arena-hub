import { Skeleton } from "@/components/ui/skeleton";

export default function CreateGroupLoading() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <div className="border-border flex w-full max-w-lg flex-col rounded-lg border p-8">
        <div className="flex flex-col items-start space-x-2 sm:flex-row sm:items-center">
          <Skeleton className="mb-4 aspect-square h-28 max-h-28 w-28 max-w-28 rounded-lg sm:mb-0" />
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-9 w-48" />
          </div>
        </div>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <footer className="mt-4">
          <Skeleton className="h-9 w-fit px-3 text-transparent">
            Criar grupo
          </Skeleton>
        </footer>
      </div>
    </main>
  );
}
