import { updateMatch } from "@/actions/match/update";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { XCircleIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { matchDetailQueryKeys } from "../_hooks";
import { useMatch } from "../_hooks/useMatch";

export const CancelMatchButton = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const memberStore = useMemberStore();
  const { data: match } = useMatch();
  const { id: matchId } = useParams<{ id: string }>();

  const cancelMatchAction = useAction(updateMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchDetailQueryKeys.match(matchId || ""),
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

  if (
    !canCancelMatch ||
    match?.status === "cancelled" ||
    match?.status === "completed"
  ) {
    return null;
  }

  return (
    <>
      <ResponsiveDialog
        title="Tem certeza que deseja cancelar esta partida?"
        description="Ao cancelar a partida, ela não poderá ser reativada e todos os dados relacionados serão perdidos."
        open={modalIsOpen}
        onOpenChange={setModalIsOpen}
        content={
          <div className="flex flex-col gap-3 md:ml-auto md:flex-row">
            <Button
              onClick={handleCancelMatch}
              variant={"outline"}
              disabled={cancelMatchAction.isPending}
            >
              Sim, cancelar partida
            </Button>
            <Button onClick={() => setModalIsOpen(false)}>
              Continuar partida
            </Button>
          </div>
        }
      />
      <Button
        variant={"outline"}
        className="hover:text-destructive"
        onClick={() => setModalIsOpen(true)}
      >
        <XCircleIcon />
        <span className="@md:hidden">Cancelar</span>
        <span className="hidden @md:block">Cancelar partida</span>
      </Button>
    </>
  );
};
