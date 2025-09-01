import { Button } from "@/components/ui/button";
import { SettingsIcon } from "lucide-react";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
} from "../_components/page-structure";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent title="Perfil" />
        <Button variant={"ghost"} size={"icon"}>
          <SettingsIcon />
        </Button>
      </PageHeader>
      <PageContent>{children}</PageContent>
    </PageContainer>
  );
}
