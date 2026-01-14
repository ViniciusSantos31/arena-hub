"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useState } from "react";
import { CreateMatchForm } from "./create-match-form";

export const CreateMatchDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <ResponsiveDialog
      title="Criar Partida"
      description="Preencha os detalhes da partida para começar."
      open={open}
      className="h-fit w-full md:max-w-xl lg:max-w-[calc(100vw-32rem)]"
      onOpenChange={() => setOpen(!open)}
      content={<CreateMatchForm />}
    >
      {children}
    </ResponsiveDialog>
  );
};
