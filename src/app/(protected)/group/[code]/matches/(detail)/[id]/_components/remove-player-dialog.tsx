"use client";

import { removePlayerFromMatch } from "@/actions/match/remove-player";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { getAvatarFallback } from "@/utils/avatar";
import { Loader2Icon, UserRoundXIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { matchDetailQueryKeys } from "../_hooks";

interface RemovePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: {
    userId: string;
    name?: string;
    image?: string | null;
  };
  matchId: string;
  organizationCode: string;
}

export function RemovePlayerDialog({
  open,
  onOpenChange,
  player,
  matchId,
  organizationCode,
}: RemovePlayerDialogProps) {
  const [reason, setReason] = useState("");
  const [banFromMatch, setBanFromMatch] = useState(false);

  const { sendEvent } = useWebSocket();

  const { execute, isExecuting } = useAction(removePlayerFromMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey.includes(matchDetailQueryKeys.players(matchId)) ||
            query.queryKey.includes(
              matchDetailQueryKeys.waitingQueue(matchId),
            ) ||
            query.queryKey.includes(matchId)
          );
        },
      });

      sendEvent({
        event: WebSocketMessageType.MATCH_PARTICIPANT_LEFT,
        payload: { playerId: player.userId, matchId },
      });

      toast.success(
        banFromMatch
          ? `${player.name} foi removido e banido desta partida.`
          : `${player.name} foi removido desta partida.`,
      );

      handleClose();
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ??
          "Não foi possível remover o jogador. Tente novamente.",
      );
    },
  });

  const handleClose = () => {
    setReason("");
    setBanFromMatch(false);
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!reason.trim()) return;

    execute({
      playerId: player.userId,
      matchId,
      organizationCode,
      reason: reason.trim(),
      banFromMatch,
    });
  };

  return (
    <ResponsiveDialog
      title="Remover jogador da partida"
      description="Esta ação removerá o jogador da partida. Informe o motivo abaixo."
      variant="destructive"
      icon={UserRoundXIcon}
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="p-0"
      content={
        <>
          <div className="h-fit space-y-2 p-4 pb-0 md:pb-4">
            <div className="flex items-center gap-3">
              <Avatar className="mb-2 size-10">
                <AvatarImage src={player.image || undefined} />
                <AvatarFallback className="text-xs">
                  {getAvatarFallback(player.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{player.name}</p>
                <p className="text-muted-foreground text-xs">
                  Jogador na partida
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="removal-reason" className="text-sm font-medium">
                Motivo da remoção <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="removal-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo da remoção..."
                rows={3}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              {reason.trim().length === 0 && reason.length > 0 && (
                <p className="text-destructive text-xs">
                  O motivo não pode estar em branco.
                </p>
              )}
            </div>

            <div className="bg-muted/40 flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="ban-toggle" className="text-sm font-medium">
                  Banir da partida
                </Label>
                <p className="text-muted-foreground text-xs">
                  Impede o jogador de se inscrever novamente nesta partida.
                </p>
              </div>
              <Switch
                id="ban-toggle"
                checked={banFromMatch}
                onCheckedChange={setBanFromMatch}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 border-t p-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isExecuting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isExecuting || !reason.trim()}
            >
              {isExecuting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Removendo...
                </>
              ) : (
                "Confirmar remoção"
              )}
            </Button>
          </DialogFooter>
        </>
      }
    />
  );
}
