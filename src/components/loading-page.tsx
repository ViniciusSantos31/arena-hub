import { Spinner } from "@/components/ui/spinner";

type LoadingPageProps = {
  label?: string;
};

export const LoadingPage = ({ label }: LoadingPageProps = {}) => {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-4 px-8">
      <Spinner size="xl" label={label} />
      {label ? (
        <span className="text-muted-foreground animate-pulse text-center text-sm font-medium">
          {label}
        </span>
      ) : null}
    </main>
  );
};
