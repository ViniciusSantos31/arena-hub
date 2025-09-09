import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function JoinGroupLoading() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <div className="border-border flex w-full max-w-lg flex-col items-center space-y-3 rounded-lg border p-8">
        <Skeleton className="h-6 w-fit text-transparent">
          Digite o código de convite do grupo
        </Skeleton>

        <div className="flex w-full items-center justify-center">
          <div className="flex w-full gap-px *:data-[slot=skeleton]:rounded-none *:first:data-[slot=skeleton]:rounded-l-lg *:last:data-[slot=skeleton]:rounded-r-lg">
            <Skeleton className="h-9 w-full flex-1" />
            <Skeleton className="h-9 w-full flex-1" />
            <Skeleton className="h-9 w-full flex-1" />
            <Skeleton className="h-9 w-full flex-1" />
            <Skeleton className="h-9 w-full flex-1" />
            <Skeleton className="h-9 w-full flex-1" />
          </div>
        </div>

        <section className="w-full">
          <div className="h-[88px] space-y-2 rounded-lg border px-4 py-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="ml-7 h-4 w-auto" />
            <Skeleton className="ml-7 h-4 w-1/4" />
          </div>
        </section>

        <section className="flex w-full flex-col items-center space-y-1">
          <div className="text-muted-foreground inline-flex w-full items-center justify-center gap-2 text-sm">
            <Separator className="flex-1" />
            <span className="animate-pulse">ou</span>
            <Separator className="flex-1" />
          </div>
          <div className="flex w-full max-w-md flex-col justify-center gap-1">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-7 w-32 self-center" />
          </div>
        </section>
      </div>
    </main>
  );
}
