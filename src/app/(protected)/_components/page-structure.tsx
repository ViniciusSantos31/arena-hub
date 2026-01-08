import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const PageContainer = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "relative flex h-dvh w-full flex-col overflow-hidden rounded-2xl",
        className,
      )}
    >
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
    <div className="flex border-b px-4 py-4">
      <div className="mr-2 flex flex-1 justify-between">{children}</div>
      <ModeToggle />
    </div>
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

export const PageContent = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "@container flex h-full flex-1 flex-col overflow-y-auto p-4 pr-2",
        className,
      )}
    >
      {children}
    </div>
  );
};
