import { saveTeamsConfig } from "@/actions/team/save";
import { Player, Team } from "@/actions/team/types";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { useMutation } from "@tanstack/react-query";
import { SaveIcon, ShuffleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const SaveTeamsConfigButton = ({
  matchId,
  teams,
  reserves,
  canSaveConfiguration,
}: {
  matchId: string;
  teams: Team[];
  reserves: Player[];
  canSaveConfiguration: boolean;
}) => {
  const { sendEvent } = useWebSocket();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutateAsync: saveTeams, isPending: isSavingConfig } = useMutation({
    mutationKey: ["save-teams-configuration"],
    mutationFn: ({
      matchId,
      teams,
      reserves,
    }: {
      matchId: string;
      teams: Team[];
      reserves: Player[];
    }) =>
      saveTeamsConfig({
        matchId,
        teams,
        reserves,
      }),
    onSuccess: () => {
      sendEvent({
        event: WebSocketMessageType.MATCH_STATUS_UPDATED,
        payload: {
          matchId,
          status: "team_sorted",
        },
      });
      queryClient.invalidateQueries({ queryKey: ["teams", matchId] });
      router.back();
    },
  });

  return (
    <ResponsiveDialog
      title="Salvar configuração de equipes"
      description="Tem certeza que deseja salvar a configuração atual de equipes? Após salvar, não será possível modificar a configuração."
      open={dialogOpen}
      onOpenChange={setDialogOpen}
      content={
        <div className="flex w-full justify-end gap-2">
          <Button variant={"outline"} onClick={() => setDialogOpen(false)}>
            <ShuffleIcon />
            Sortear novamente
          </Button>
          <Button
            onClick={() => saveTeams({ matchId, teams, reserves })}
            disabled={isSavingConfig}
          >
            <SaveIcon />
            Salvar configuração
          </Button>
        </div>
      }
    >
      <Button disabled={!canSaveConfiguration}>
        <SaveIcon />
        Salvar configuração
      </Button>
    </ResponsiveDialog>
  );
};
