import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../../(protected)/_components/page-structure";

export default function CreateGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Criar grupo" />
      </PageHeader>
      <PageContent className="relative">{children}</PageContent>
    </PageContainer>
  );
}
