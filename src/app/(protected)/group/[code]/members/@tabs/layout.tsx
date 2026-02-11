"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGuard } from "@/hooks/use-guard";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

const CustomTabsTrigger = (props: React.ComponentProps<typeof TabsTrigger>) => {
  return (
    <TabsTrigger
      {...props}
      className="data-[state=active]:bg-background dark:data-[state=active]:bg-background data-[state=active]:border-primary data-[state=active]:text-primary border-b-primary data-[state=active]:border-b-primary dark:data-[state=active]:border-primary max-w-fit flex-1 rounded-none border-0 border-b-2 border-transparent px-8 text-center"
    />
  );
};

export default function GroupMembersParallelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment() || "active";

  const canHandleRequests = useGuard({
    action: ["membership:approve"],
  });

  return (
    <Tabs
      className="flex h-full gap-0 *:data-[slot=tabs-content]:px-4"
      defaultValue={segment}
    >
      <TabsList className="bg-background sticky top-0 z-10 min-h-12 w-full justify-start rounded-none border-b p-0">
        <CustomTabsTrigger value="active" asChild>
          <Link href={"active"}>Ativos</Link>
        </CustomTabsTrigger>
        {canHandleRequests && (
          <CustomTabsTrigger value="request" asChild>
            <Link href={"request"}>Solicitações</Link>
          </CustomTabsTrigger>
        )}
      </TabsList>
      <TabsContent value={segment} className="overflow-y-auto">
        {children}
      </TabsContent>
    </Tabs>
  );
}
