import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";

export const DeleteGroupButton = ({
  group,
}: {
  group: { name: string; id: string };
}) => {
  const DeleteConfirmationContent = () => (
    <div className="space-y-4">
      <div className="text-sm">
        <p>
          Esta ação não pode ser desfeita. Isso irá excluir permanentemente o
          grupo
          <strong> {group.name}</strong> e remover todos os dados associados
          incluindo:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>Todos os membros e suas informações</li>
          <li>Histórico de partidas</li>
          <li>Configurações e regras</li>
          <li>Pedidos de entrada pendentes</li>
        </ul>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline">Cancelar</Button>
        <Button variant="destructive">Sim, excluir grupo</Button>
      </div>
    </div>
  );
  return (
    <ResponsiveDialog
      title="Tem certeza que deseja excluir este grupo?"
      description="Esta ação é irreversível e resultará na perda de todos os dados associados ao grupo."
      content={<DeleteConfirmationContent />}
    >
      <Button variant="destructive" disabled>
        Excluir Grupo (Em breve)
      </Button>
    </ResponsiveDialog>
  );
};
