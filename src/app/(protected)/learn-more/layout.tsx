import { BookOpenTextIcon } from "lucide-react";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";
import { ToggleSectionsSidebar } from "./_hooks/toggle-sections-sidebar";
import { SectionsSidebarProvider } from "./_hooks/use-sections-sidebar";

export default function LearnMoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SectionsSidebarProvider>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent title="Central de aprendizado" />
          <ToggleSectionsSidebar>
            <BookOpenTextIcon />
            Seções
          </ToggleSectionsSidebar>
        </PageHeader>
        <PageContent className="p-0">{children}</PageContent>
      </PageContainer>
    </SectionsSidebarProvider>
  );
}
