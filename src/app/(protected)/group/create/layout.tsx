import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../../../(protected)/_components/page-structure";
import { CreateGroupGate } from "./_components/create-group-gate";

export default async function CreateGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <CreateGroupGate>
        <PageHeader>
          <PageHeaderContent title="Criar grupo" />
        </PageHeader>
        <PageContent className="relative">{children}</PageContent>
      </CreateGroupGate>
    </PageContainer>
  );
}
