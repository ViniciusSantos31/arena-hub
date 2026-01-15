"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useGuard } from "@/hooks/use-guard";
import { useState } from "react";
import { useMemberStore } from "../../_store/group";
import { CreateMatchForm } from "./create-match-form";

export const CreateMatchDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const canCreateMatch = useGuard({
    action: "match:create",
  });

  console.log(
    "Can create match:",
    canCreateMatch(useMemberStore.getState().member),
    useMemberStore.getState().member,
  );

  if (!canCreateMatch(useMemberStore.getState().member)) {
    return null;
  }

  return (
    <ResponsiveDialog
      title="Criar Partida"
      description="Preencha os detalhes da partida para começar."
      open={open}
      className="h-fit w-full md:max-w-xl lg:max-w-[calc(100vw-32rem)]"
      onOpenChange={() => setOpen(!open)}
      content={<CreateMatchForm setOpen={setOpen} />}
    >
      {children}
    </ResponsiveDialog>
  );
};
