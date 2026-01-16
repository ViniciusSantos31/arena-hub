"use client";

import { updateMatch } from "@/actions/match/update";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGuard } from "@/hooks/use-guard";
import { queryClient } from "@/lib/react-query";
import { ShuffleIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { useMatch } from "../_hooks/useMatch";
import { CancelMatchButton } from "./cancel-match-button";
import { CloseRegistrationButton } from "./close-registration-button";
import { DeleteMatchButton } from "./delete-match-button";

export const AdvancedSettingsSection = () => {
  const { data: match } = useMatch();

  const updateMatchAction = useAction(updateMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["match", match?.id],
      });
    },
  });
  const matchStatus = match?.status;
  const memberStore = useMemberStore();

  const canModifyMatch = useGuard({
    action: ["match:update", "team:create"],
  });

  const showShuffleTeamsButton = matchStatus === "closed_registration";

  const handleShuffleTeams = async () => {
    try {
      await updateMatchAction.executeAsync({
        organizationId: memberStore.member?.organizationId || "",
        match: {
          id: match?.id || "",
          status: "team_sorted",
        },
      });
      toast.success("Sorteio dos times realizado com sucesso.");
    } catch {
      toast.error("Erro ao realizar o sorteio dos times.");
    }
  };

  if (!canModifyMatch) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações avançadas</CardTitle>
        <CardDescription>
          Só você e outros moderadores do grupo podem ver e alterar essas
          configurações.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {showShuffleTeamsButton && (
          <Button
            variant="outline"
            className="hidden @sm:flex"
            onClick={handleShuffleTeams}
          >
            <ShuffleIcon />
            <span className="hidden @md:block">Realizar sorteio</span>
            <span className="@md:hidden">Sortear</span>
          </Button>
        )}
        <CloseRegistrationButton />
        <CancelMatchButton />
        <DeleteMatchButton />
      </CardContent>
    </Card>
  );
};
