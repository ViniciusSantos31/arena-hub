import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../_components/page-structure";

export default function GroupDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Visualizar grupo" />
      </PageHeader>
      <PageContent>{children}</PageContent>
    </PageContainer>
  );
}
