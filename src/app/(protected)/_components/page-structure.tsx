import { SidebarTrigger } from "@/components/ui/sidebar";

export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="@container relative flex h-screen w-full flex-col overflow-hidden rounded-2xl">
      {children}
    </div>
  );
};

export const PageHeaderContent = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="flex items-start justify-between space-x-2">
      <SidebarTrigger />
      <div className="flex flex-1 flex-col space-y-1">
        <PageTitle>{title}</PageTitle>
        {description && <PageDescription>{description}</PageDescription>}
      </div>
    </div>
  );
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-between border-b px-4 py-4">{children}</div>
  );
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="font-mono text-lg font-bold">{children}</h1>;
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="text-muted-foreground">{children}</p>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full flex-1 flex-col overflow-y-scroll p-4 pr-2">
      {children}
    </div>
  );
};
