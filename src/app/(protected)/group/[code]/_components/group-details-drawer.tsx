"use client";

import { leaveGroup } from "@/actions/member/leave-group";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  AlertTriangleIcon,
  InfoIcon,
  LogOutIcon,
  ScrollTextIcon,
  Settings2Icon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface GroupDetailsDrawerProps {
  group: {
    name: string;
    code: string;
    description?: string | null;
    logo?: string | null;
    rules?: string | null;
  };
  memberRole: string;
}

export function GroupDetailsDrawer({
  group,
  memberRole,
}: GroupDetailsDrawerProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [showMoreRules, setShowMoreRules] = useState(200);

  const isOwner = memberRole === "owner";

  const { execute: leave, isExecuting: isLeaving } = useAction(leaveGroup, {
    onSuccess: () => {
      toast.success("Você saiu do grupo com sucesso.");
      setOpen(false);
      router.push("/home");
    },
    onError({ error }) {
      toast.error(
        error.serverError ?? "Não foi possível sair do grupo. Tente novamente.",
      );
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    setShowMoreRules(200);
    if (!nextOpen) setConfirmLeave(false);
  };

  const handleLeave = () => {
    leave({ organizationCode: group.code });
  };

  const hasRules = !!group.rules;
  const limitedRules = group.rules?.slice(0, showMoreRules);
  const hasMoreRules = limitedRules?.length !== group.rules?.length;

  const hasDescription = !!group.description;
  const showDangerZone = !isOwner;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2Icon />
          <span className="text-xs md:text-base">Preferências</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col gap-0 p-0",
          isMobile && "max-h-[85dvh] rounded-t-2xl",
        )}
      >
        <SheetHeader className="border-border/60 border-b px-5 py-4">
          <SheetTitle className="text-base">
            {group.logo && (
              <Image
                src={group.logo}
                alt={group.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            {group.name}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-0 overflow-y-auto">
          {hasRules && (
            <section className="border-border/60 border-b">
              <div className="flex items-center gap-2 px-5 py-3">
                <ScrollTextIcon className="text-muted-foreground size-4 shrink-0" />
                <h2 className="text-sm font-semibold">Regras do grupo</h2>
              </div>
              <p className="text-muted-foreground px-5 pb-5 text-sm leading-relaxed whitespace-pre-wrap">
                {limitedRules}{" "}
                {hasMoreRules && (
                  <a
                    href="#"
                    onClick={() => {
                      setShowMoreRules(group.rules?.length ?? 200);
                    }}
                    className="text-primary underline"
                  >
                    Ler mais
                  </a>
                )}
              </p>
            </section>
          )}

          {!hasRules && (
            <section className="border-border/60 border-b px-5 py-5">
              <div className="flex items-center gap-2">
                <ScrollTextIcon className="text-muted-foreground size-4 shrink-0" />
                <h2 className="text-sm font-semibold">Regras do grupo</h2>
              </div>
              <p className="text-muted-foreground mt-2 text-sm">
                Este grupo ainda não definiu regras.
              </p>
            </section>
          )}

          {hasDescription && (
            <section className="border-border/60 border-b">
              <div className="flex items-center gap-2 px-5 py-3">
                <InfoIcon className="text-muted-foreground size-4 shrink-0" />
                <h2 className="text-sm font-semibold">Descrição do grupo</h2>
              </div>
              <p className="text-muted-foreground px-5 pb-5 text-sm leading-relaxed whitespace-pre-wrap">
                {group.description}
              </p>
            </section>
          )}

          <section className="border-border/60 border-b px-5 py-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontalIcon className="text-muted-foreground size-4 shrink-0" />
              <h2 className="text-sm font-semibold">Preferências</h2>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Em breve você poderá configurar notificações, seu nome no grupo e
              outras preferências por aqui.
            </p>
          </section>

          {showDangerZone && (
            <section className="px-5 py-5">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="text-destructive size-4 shrink-0" />
                <h2 className="text-destructive text-sm font-semibold">
                  Zona de perigo
                </h2>
              </div>

              <div className="border-destructive/20 bg-destructive/5 mt-3 rounded-xl border p-4">
                {!confirmLeave ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Sair do grupo</p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        Você perderá acesso a partidas e ao histórico.
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shrink-0"
                      onClick={() => setConfirmLeave(true)}
                    >
                      <LogOutIcon />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-balance">
                      Tem certeza que deseja sair do grupo{" "}
                      <span className="text-primary font-semibold">
                        {group.name}
                      </span>
                      ?
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Esta ação não pode ser desfeita. Para entrar novamente,
                      você precisará de um novo convite.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        disabled={isLeaving}
                        onClick={() => setConfirmLeave(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        disabled={isLeaving}
                        onClick={handleLeave}
                      >
                        {isLeaving ? "Saindo..." : "Confirmar saída"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
