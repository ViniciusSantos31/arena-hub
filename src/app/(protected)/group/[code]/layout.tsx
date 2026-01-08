import { getGroupDetails } from "@/actions/group/detail";
import { getUserMembershipStatus } from "@/actions/group/membership";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, UploadIcon } from "lucide-react";
import Image from "next/image";
import { notFound, redirect, RedirectType } from "next/navigation";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../_components/page-structure";
import { GroupNav } from "./_components/group-nav";

export default async function GroupDetailsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const group = await getGroupDetails({ code });

  if (!group.data) return notFound();

  const userIsMember = await getUserMembershipStatus({
    organizationId: group.data.id,
  });

  if (!userIsMember.data) return redirect("/home", RedirectType.replace);

  const { name, logo } = group.data;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Visualizar grupo" />
      </PageHeader>
      <PageContent className="h-fit">
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
          <aside className="space-x-2">
            <Button variant={"outline"}>
              <UploadIcon />
              Convidar jogadores
            </Button>
            <Button size={"icon"} variant={"outline"}>
              <MoreVerticalIcon />
            </Button>
          </aside>
        </section>
        {children}
      </PageContent>
      <GroupNav />
    </PageContainer>
  );
}
