import { Loader2Icon } from "lucide-react";

export const LoadingGroupPage = () => {
  return (
    <div className="mx-auto my-auto flex h-full flex-col items-center justify-center gap-2 px-8">
      <Loader2Icon className="text-primary size-16 animate-spin" />
      <span className="text-center font-medium">
        Aguarde enquanto carregamos as informações do grupo...
      </span>
    </div>
  );
};
