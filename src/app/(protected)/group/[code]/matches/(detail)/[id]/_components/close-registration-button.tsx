import { updateMatch } from "@/actions/match/update";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { TicketXIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { useMatch } from "../_hooks/useMatch";

export const CloseRegistrationButton = () => {
  const { data: match } = useMatch();
  const memberStore = useMemberStore();
  const updateMatchAction = useAction(updateMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match", match?.id],
      });
      toast.success("Registro de inscrição fechado com sucesso.", {
        id: "close-registration",
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
    <Button variant="secondary" onClick={handleCloseRegistration}>
      <TicketXIcon />
      <span className="@md:hidden">Encerrar</span>
      <span className="hidden @md:block">Encerrar inscrição</span>
    </Button>
  );
};
