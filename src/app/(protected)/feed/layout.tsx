import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Explorar" />
      </PageHeader>
      <PageContent className="w-full pt-0">{children}</PageContent>
    </PageContainer>
  );
}
