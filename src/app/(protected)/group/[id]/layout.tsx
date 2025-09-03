import { getGroupDetails } from "@/actions/group/detail";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { UploadIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../../(protected)/_components/page-structure";
import { GroupNav } from "./_components/group-nav";

export default async function GroupDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await getGroupDetails({ id });

  if (!group.data) return notFound();

  const { name, logo } = group.data;

  return (
    <div className="flex min-h-svh w-full">
      <SidebarInset className="flex-1 overflow-hidden rounded-2xl">
        <PageContainer>
          <PageHeader>
            <PageHeaderContent title="Visualizar grupo" />
          </PageHeader>
          <PageContent>
            <section className="mb-4 flex flex-col justify-between gap-3 @lg:flex-row @lg:items-center">
              <div className="flex flex-1 flex-col space-y-1">
                <span className="text-muted-foreground text-sm">
                  Você está visualizando o grupo
                </span>
                <div className="flex items-center space-x-2">
                  {logo && (
                    <Image
                      src={logo}
                      alt={name}
                      width={24}
                      height={24}
                      className="h-8 w-8 rounded-sm object-cover"
                    />
                  )}
                  <h1 className="text-2xl font-bold">{name}</h1>
                </div>
              </div>
              <aside>
                <Button variant={"outline"}>
                  <UploadIcon />
                  Convidar jogadores
                </Button>
              </aside>
            </section>
            {children}
          </PageContent>
        </PageContainer>
        <GroupNav />
      </SidebarInset>
      {/* <GroupSidebar /> */}
    </div>
  );
}
