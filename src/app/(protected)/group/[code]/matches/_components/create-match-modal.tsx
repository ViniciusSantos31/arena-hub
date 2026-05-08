"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useGuard } from "@/hooks/use-guard";
import { CalendarPlusIcon } from "lucide-react";
import { useState } from "react";
import { CreateMatchForm } from "./create-match-form";

export const CreateMatchDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const canCreateMatch = useGuard({
    action: ["match:create"],
  });

  if (!canCreateMatch) {
    return null;
  }

  return (
    <ResponsiveDialog
      title="Criar Partida"
      description="Preencha os detalhes da partida para começar."
      icon={CalendarPlusIcon}
      open={open}
      contentClassName="pb-0 md:pb-4"
      className="h-fit w-full md:max-w-xl lg:max-w-[calc(100vw-32rem)]"
      onOpenChange={() => setOpen(!open)}
      content={<CreateMatchForm setOpen={setOpen} />}
    >
      {children}
    </ResponsiveDialog>
  );
};
