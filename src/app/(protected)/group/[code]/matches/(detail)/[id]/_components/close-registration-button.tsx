import { updateMatch } from "@/actions/match/update";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { TicketXIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { matchDetailQueryKeys } from "../_hooks";
import { useMatch } from "../_hooks/useMatch";

export const CloseRegistrationButton = () => {
  const { data: match } = useMatch();
  const memberStore = useMemberStore();

  const { sendEvent } = useWebSocket();

  const updateMatchAction = useAction(updateMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchDetailQueryKeys.match(match?.id || ""),
      });
      toast.success("Registro de inscrição fechado com sucesso.", {
        id: "close-registration",
      });
      sendEvent({
        event: WebSocketMessageType.MATCH_STATUS_UPDATED,
        payload: {
          matchId: match?.id || "",
          status: "closed_registration",
        },
      });
    },
    onError: () => {
      toast.error("Não foi possível fechar o registro de inscrição.", {
        id: "close-registration",
      });
    },
  });

  const canUpdateMatch = useGuard({
    action: ["match:update"],
  });

  const handleCloseRegistration = async () => {
    await updateMatchAction.executeAsync({
      organizationId: memberStore.member?.organizationId || "",
      match: {
        id: match?.id || "",
        status: "closed_registration",
      },
    });
  };

  if (!canUpdateMatch || match?.status !== "open_registration") {
    return null;
  }

  return (
    <Button variant="outline" onClick={handleCloseRegistration}>
      <TicketXIcon />
      <span className="@md:hidden">Encerrar</span>
      <span className="hidden @md:block">Encerrar inscrição</span>
    </Button>
  );
};
