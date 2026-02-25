import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { revalidatePath } from "next/cache";

export const RefreshDataButton = () => {
  const refetchPage = async () => {
    "use server";
    revalidatePath("/admin");
  };

  return (
    <Button variant="outline" size="sm" onClick={refetchPage}>
      <RefreshCcwIcon className="h-4 w-4" />
      Atualizar
    </Button>
  );
};
