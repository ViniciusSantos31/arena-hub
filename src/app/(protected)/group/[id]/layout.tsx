import { SidebarInset } from "@/components/ui/sidebar";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../../(protected)/_components/page-structure";
import { GroupSidebar } from "./_components/group-sidebar";

export default function GroupDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <SidebarInset className="flex-1">
        <PageContainer>
          <PageHeader>
            <PageHeaderContent title="Visualizar grupo" />
          </PageHeader>
          <PageContent>{children}</PageContent>
        </PageContainer>
      </SidebarInset>
      <GroupSidebar />
    </div>
  );
}
