import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "@/app/(protected)/_components/page-structure";

export default function FeedbacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Feedbacks" />
      </PageHeader>
      <PageContent>{children}</PageContent>
    </PageContainer>
  );
}
