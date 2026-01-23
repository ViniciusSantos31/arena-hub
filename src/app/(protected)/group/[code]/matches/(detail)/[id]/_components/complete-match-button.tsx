import { updateMatch } from "@/actions/match/update";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { CheckCircle2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { useMatch } from "../_hooks/useMatch";

export const CompleteMatchButton = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { data: match } = useMatch();

  const { sendEvent } = useWebSocket();

  const memberStore = useMemberStore();
  const updateMatchAction = useAction(updateMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match", match?.id],
      });
      toast.success("Partida concluída com sucesso.", {
        id: "complete-match",
      });
      sendEvent({
        event: WebSocketMessageType.MATCH_STATUS_UPDATED,
        payload: {
          matchId: match?.id || "",
          status: "completed",
        },
      });
    },
    onError: () => {
      toast.error("Não foi possível concluir a partida.", {
        id: "complete-match",
      });
    },
  });

  const canCompleteMatch =
    match?.status !== "cancelled" && match?.status === "team_sorted";

  const handleCompleteMatch = async () => {
    await updateMatchAction.executeAsync({
      organizationId: memberStore.member?.organizationId || "",
      match: {
        id: match?.id || "",
        status: "completed",
      },
    });
  };

  if (!canCompleteMatch) {
    return null;
  }

  return (
    <>
      <ResponsiveDialog
        title="Concluir partida"
        description={
          "Ao concluir a partida, os resultados finais serão registrados e os jogadores não poderão mais ser adicionados ou removidos. Tem certeza que deseja prosseguir?"
        }
        open={modalIsOpen}
        onOpenChange={(open) => setModalIsOpen(open)}
        content={
          <Button
            onClick={handleCompleteMatch}
            disabled={updateMatchAction.isPending}
          >
            <CheckCircle2Icon />
            Sim, concluir
          </Button>
        }
      />
      <Button variant="outline" onClick={() => setModalIsOpen(true)}>
        <CheckCircle2Icon />
        <span className="hidden @md:block">Concluir partida</span>
        <span className="@md:hidden">Concluir</span>
      </Button>
    </>
  );
};
