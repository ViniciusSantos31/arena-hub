"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useState } from "react";

export const CreateMatchDialog = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog
      title="Criar Partida"
      description="Preencha os detalhes da partida para começar."
      open={open}
      className="w-full sm:h-[calc(100vh-2rem)] sm:max-w-[calc(100vw-2rem)]"
      onOpenChange={() => setOpen(!open)}
      content={
        <div className="p-4">Conteúdo do formulário de criação de partida</div>
      }
    >
      {children}
    </ResponsiveDialog>
  );
};
