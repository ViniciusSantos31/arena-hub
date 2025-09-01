import { SidebarTrigger } from "@/components/ui/sidebar";

export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex w-full flex-col space-y-2 py-4">{children}</div>;
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
        <h1 className="font-mono text-xl font-bold">{title}</h1>
        {description && <PageDescription>{description}</PageDescription>}
      </div>
    </div>
  );
};

export const PageHeader = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex flex-1 justify-between px-4">{children}</div>;
};

export const PageTitle = ({ children }: { children: React.ReactNode }) => {
  return <h1 className="font-mono text-xl font-bold">{children}</h1>;
};

export const PageDescription = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <p className="text-muted-foreground">{children}</p>;
};

export const PageContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex-1 px-4">{children}</div>;
};
