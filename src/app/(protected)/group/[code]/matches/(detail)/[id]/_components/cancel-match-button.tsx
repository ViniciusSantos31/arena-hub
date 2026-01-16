import { updateMatch } from "@/actions/match/update";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { XCircleIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { useMatch } from "../_hooks/useMatch";

export const CancelMatchButton = () => {
  const memberStore = useMemberStore();
  const { data: match } = useMatch();
  const { id: matchId } = useParams<{ id: string }>();

  const cancelMatchAction = useAction(updateMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match", matchId],
      });
      toast.success("Partida cancelada com sucesso.", { id: "cancel-match" });
    },
    onError: () => {
      toast.error("Não foi possível cancelar a partida.", {
        id: "cancel-match",
      });
    },
  });

  const canCancelMatch = useGuard({
    action: ["match:update"],
  });

  const handleCancelMatch = async () => {
    await cancelMatchAction.executeAsync({
      organizationId: memberStore.member?.organizationId || "",
      match: {
        id: matchId,
        status: "cancelled",
      },
    });
  };

  if (!canCancelMatch || match?.status === "cancelled") {
    return null;
  }

  return (
    <Button
      variant={"outline"}
      className="hover:text-destructive"
      onClick={handleCancelMatch}
    >
      <XCircleIcon />
      <span className="@md:hidden">Cancelar</span>
      <span className="hidden @md:block">Cancelar partida</span>
    </Button>
  );
};
