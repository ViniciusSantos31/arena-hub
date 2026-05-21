"use client";

import { getJoinRequestsCount } from "@/actions/group/get-join-requests-count";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuard } from "@/hooks/use-guard";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

const CustomTabsTrigger = (props: React.ComponentProps<typeof TabsTrigger>) => {
  return (
    <TabsTrigger
      {...props}
      className="data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary border-b-primary data-[state=active]:border-b-primary dark:data-[state=active]:border-primary max-w-fit flex-1 rounded-none border-0 border-b-2 border-transparent px-5 text-center focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 sm:px-8"
    />
  );
};

export default function GroupMembersParallelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment() || "active";
  const { code } = useParams<{ code: string }>();
  const canApprove = useGuard({ action: ["membership:approve"] });

  const { data: requestsCount } = useQuery({
    queryKey: ["join-requests-count", code],
    queryFn: async () => {
      const res = await getJoinRequestsCount({ organizationCode: code });
      return res?.data ?? 0;
    },
    enabled: canApprove && !!code,
    staleTime: 30_000,
  });

  return (
    <Tabs
      className="flex h-full gap-0 *:data-[slot=tabs-content]:px-4"
      defaultValue={segment}
    >
      <TabsList
        aria-label="Abas de membros"
        className="bg-background sticky top-0 z-10 min-h-12 w-full justify-start overflow-x-auto rounded-none border-b p-0"
      >
        <CustomTabsTrigger value="active" asChild>
          <Link href={"active"}>Ativos</Link>
        </CustomTabsTrigger>
        {canApprove && (
          <CustomTabsTrigger value="requests" asChild>
            <Link href={"requests"} className="flex items-center gap-2">
              Solicitações
              {!!requestsCount && requestsCount > 0 && (
                <Badge className="bg-primary/10 text-primary aspect-square h-5 min-w-5 px-1 text-xs">
                  {requestsCount}
                </Badge>
              )}
            </Link>
          </CustomTabsTrigger>
        )}
      </TabsList>
      <TabsContent value={segment} className="overflow-y-auto">
        {children}
      </TabsContent>
    </Tabs>
  );
}
