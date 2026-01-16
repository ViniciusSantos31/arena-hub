import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchCardLoading } from "../matches/_components/match-card";

export default function GroupDashboardLoading() {
  return (
    <main className="grid w-full gap-4 @2xl:grid-cols-2">
      <section className="flex w-full flex-wrap gap-4">
        {/* Next Match Card Loading */}
        <MatchCardLoading />

        {/* Matches Section Loading */}
        <Card className="bg-card @container/card w-full border shadow-sm">
          <CardHeader className="border-b pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="hidden @[26rem]/card:flex">
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="bg-accent mt-6 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex border-t @[26rem]/card:hidden">
            <Skeleton className="ml-auto h-10 w-28" />
          </CardFooter>
        </Card>
      </section>

      <section className="flex h-fit w-full flex-1 flex-wrap gap-4">
        {/* Members Section Loading */}
        <Card className="bg-card @container/card w-full border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="hidden @[28rem]/card:flex">
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-9 w-12" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex border-t @[28rem]/card:hidden">
            <Skeleton className="ml-auto h-10 w-28" />
          </CardFooter>
        </Card>

        {/* Rankings Section Loading */}
        {/* <Card className="bg-card @container/card w-full border shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <div className="hidden @[28rem]/card:flex">
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex border-t @[28rem]/card:hidden">
            <Skeleton className="ml-auto h-10 w-36" />
          </CardFooter>
        </Card> */}
      </section>
    </main>
  );
}
