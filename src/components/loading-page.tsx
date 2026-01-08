import { Loader2Icon } from "lucide-react";

export const LoadingPage = () => {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <Loader2Icon className="size-18 animate-spin" />
    </main>
  );
};
