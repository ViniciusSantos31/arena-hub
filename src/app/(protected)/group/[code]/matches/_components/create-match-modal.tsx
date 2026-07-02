"use client";

import { PlanPickerDialog } from "@/app/(protected)/_components/plan-picker-dialog";
import { useMemberStore } from "@/app/(protected)/group/[code]/_store/group";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import { CalendarPlusIcon, CreditCardIcon } from "lucide-react";
import { useState } from "react";
import { useMatchesPlan } from "../_contexts/matches-plan";
import { CreateMatchForm } from "./create-match-form";

export const CreateMatchDialog = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);
  const { ownerCanCreateMatch } = useMatchesPlan();
  const member = useMemberStore((state) => state.member);

  const canCreateMatch = useGuard({
    action: ["match:create"],
  });

  if (!canCreateMatch) {
    return null;
  }

  if (!ownerCanCreateMatch) {
    const isOwner = member?.role === "owner";

    if (isOwner) {
      return (
        <>
          <PlanPickerDialog
            open={blockedOpen}
            onOpenChange={setBlockedOpen}
            reason="subscription_required_for_match"
          >
            {children}
          </PlanPickerDialog>
        </>
      );
    }

    return (
      <ResponsiveDialog
        title="Assinatura do organizador"
        description="Não é possível criar partidas neste grupo no momento."
        icon={CreditCardIcon}
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        content={
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              O organizador do grupo precisa ter uma assinatura ativa para criar
              novas partidas. Entre em contato com o organizador para
              regularizar o plano.
            </p>
            <Button className="w-full" onClick={() => setBlockedOpen(false)}>
              Entendi
            </Button>
          </div>
        }
      >
        {children}
      </ResponsiveDialog>
    );
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
