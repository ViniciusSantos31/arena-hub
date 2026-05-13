"use client";

import { punishMember as punishMemberAction } from "@/actions/member/punish";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { queryClient } from "@/lib/react-query";
import { AlertTriangleIcon, Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface PunishMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: {
    id?: string;
    name?: string;
  };
  organizationCode: string;
}

export function PunishMemberDialog({
  open,
  onOpenChange,
  member,
  organizationCode,
}: PunishMemberDialogProps) {
  const [reason, setReason] = useState("");

  const { execute, isExecuting } = useAction(punishMemberAction, {
    onSuccess: () => {
      toast.success("Punição registrada com sucesso");
      handleClose();
      queryClient.invalidateQueries({
        queryKey: ["active-members", organizationCode],
      });
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Não foi possível registrar a punição.",
      );
    },
  });

  const handleClose = () => {
    setReason("");
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!member.id) return;
    execute({
      memberId: member.id,
      organizationCode,
      reason: reason.trim() || undefined,
    });
  };

  return (
    <ResponsiveDialog
      title="Punir membro"
      description={`Registrar uma punição para ${member.name ?? "este membro"}. Ao atingir o limite de punições configurado, o jogador será suspenso automaticamente.`}
      variant="warning"
      icon={AlertTriangleIcon}
      open={open}
      onOpenChange={onOpenChange}
      contentClassName="p-0"
      content={
        <>
          <div className="h-fit space-y-3 p-4 pb-0 md:pb-4">
            <div className="space-y-2">
              <Label htmlFor="punish-reason" className="text-sm font-medium">
                Motivo{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <textarea
                id="punish-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo da punição..."
                rows={3}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleConfirm}
              disabled={isExecuting || !member.id}
            >
              {isExecuting ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Confirmar punição"
              )}
            </Button>
          </DialogFooter>
        </>
      }
    />
  );
}
