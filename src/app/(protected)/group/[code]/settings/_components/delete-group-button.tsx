"use client";

import { deleteGroup } from "@/actions/group/delete";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const DeleteGroupButton = ({
  group,
}: {
  group: { name: string; code: string };
}) => {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const router = useRouter();

  const deleteAction = useAction(deleteGroup, {
    onSuccess: () => {
      toast.success("Grupo excluído com sucesso.", { id: "delete-group" });
      setOpen(false);
      setConfirmName("");
      router.push("/home");
    },
    onError({ error }) {
      toast.error(error.serverError ?? "Não foi possível excluir o grupo.", {
        id: "delete-group",
      });
    },
  });

  const handleConfirm = async () => {
    await deleteAction.executeAsync({ code: group.code });
  };

  const canDelete = confirmName === group.name && !deleteAction.isExecuting;

  const content = (
    <div className="space-y-4">
      <div className="p-4 text-sm">
        <p>
          Esta ação não pode ser desfeita. O grupo
          <strong> {group.name}</strong> será excluído permanentemente e todos
          os dados relacionados serão apagados, incluindo:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Todos os membros e suas informações no grupo</li>
          <li>Histórico de partidas e inscrições</li>
          <li>Configurações, regras e descrição</li>
          <li>Pedidos de entrada pendentes</li>
          <li>Links de convite ativos</li>
        </ul>
      </div>
      <div className="space-y-2 border-t px-4 pt-4">
        <p className="text-sm font-medium">
          Para confirmar, digite o nome do grupo:
          <span className="font-semibold">{` ${group.name}`}</span>
        </p>
        <Input
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={group.name}
          autoComplete="off"
          spellCheck={false}
          onPaste={(e) => e.preventDefault()}
          onCopy={(e) => e.preventDefault()}
          onCut={(e) => e.preventDefault()}
          onDrop={(e) => e.preventDefault()}
        />
        <p className="text-muted-foreground text-xs">
          Por segurança, colar não é permitido.
        </p>
      </div>
      <div className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={deleteAction.isExecuting}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={handleConfirm}
          disabled={!canDelete}
        >
          {deleteAction.isExecuting
            ? "Excluindo..."
            : `Excluir grupo "${group.name}"`}
        </Button>
      </div>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={setOpen}
      title="Excluir grupo permanentemente?"
      variant="destructive"
      description="Esta ação é irreversível. Não será possível recuperar membros, partidas nem histórico."
      icon={Trash2Icon}
      contentClassName="p-0"
      content={content}
    >
      <Button variant="destructive" type="button">
        Excluir grupo
      </Button>
    </ResponsiveDialog>
  );
};
