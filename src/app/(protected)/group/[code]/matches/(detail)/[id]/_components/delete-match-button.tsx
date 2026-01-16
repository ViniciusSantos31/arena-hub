import { deleteMatch } from "@/actions/match/delete";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { useMatch } from "../_hooks/useMatch";

export const DeleteMatchButton = () => {
  const router = useRouter();
  const { data: match } = useMatch();
  const memberStore = useMemberStore();
  const deleteMatchAction = useAction(deleteMatch, {
    onSuccess: () => {
      toast.success("Partida excluída com sucesso.", { id: "delete-match" });
      router.back();
    },
    onError: () => {
      toast.error("Não foi possível excluir a partida.", {
        id: "delete-match",
      });
    },
  });

  const canDeleteMatch = useGuard({
    action: ["match:delete"],
  });

  const handleDeleteMatch = async () => {
    await deleteMatchAction.executeAsync({
      organizationId: memberStore.member?.organizationId || "",
      matchId: match?.id || "",
    });
  };

  if (!canDeleteMatch || match?.status !== "cancelled") {
    return null;
  }

  return (
    <Button variant="destructive" onClick={handleDeleteMatch}>
      <Trash2Icon />
      <span className="@md:hidden">Excluir</span>
      <span className="hidden @md:block">Excluir partida</span>
    </Button>
  );
};
