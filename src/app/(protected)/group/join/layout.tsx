import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../../(protected)/_components/page-structure";

export default function JoinGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Entrar em um grupo" />
      </PageHeader>
      <PageContent>{children}</PageContent>
    </PageContainer>
  );
}
