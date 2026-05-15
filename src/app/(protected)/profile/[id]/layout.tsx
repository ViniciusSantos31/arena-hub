import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageTitle,
} from "../../_components/page-structure";

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <div className="flex flex-1 items-center gap-1">
          <SidebarTrigger />

          <PageTitle>Perfil do jogador</PageTitle>
        </div>
      </PageHeader>
      <PageContent className="px-0">{children}</PageContent>
    </PageContainer>
  );
}
