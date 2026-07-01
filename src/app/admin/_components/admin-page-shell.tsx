import {
  PageContainer,
  PageContent,
  PageDescription,
  PageTitle,
} from "@/app/(protected)/_components/page-structure";
import { cn } from "@/lib/utils";

interface AdminPageShellProps {
  title: string;
  description?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function AdminPageShell({
  title,
  description,
  contentClassName,
  children,
}: AdminPageShellProps) {
  return (
    <PageContainer>
      <PageContent className={cn("gap-0", contentClassName)}>
        <div className="space-y-1 pb-4">
          <PageTitle>{title}</PageTitle>
          {description ? <PageDescription>{description}</PageDescription> : null}
        </div>
        {children}
      </PageContent>
    </PageContainer>
  );
}
