"use client";

import { requestToJoinGroup } from "@/actions/group/request-to-join";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { LockIcon, SendIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface JoinRequestSheetProps {
  group: { code: string; name: string } | null;
  onClose: () => void;
  onSuccess: (code: string) => void;
}

export function JoinRequestSheet({
  group,
  onClose,
  onSuccess,
}: JoinRequestSheetProps) {
  const [message, setMessage] = useState("");

  const { execute, isPending } = useAction(requestToJoinGroup, {
    onSuccess: () => {
      toast.success("Solicitação enviada! Aguarde a aprovação do moderador.");
      setMessage("");
      onSuccess(group!.code);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao enviar solicitação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    execute({ organizationCode: group.code, message });
  };

  const charCount = message.length;
  const isValid = charCount >= 10 && charCount <= 500;

  return (
    <ResponsiveDialog
      title="Solicitar entrada"
      description={group?.name}
      open={!!group}
      onOpenChange={(open) => {
        if (!open) {
          setMessage("");
          onClose();
        }
      }}
      icon={LockIcon}
      content={
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Este é um grupo privado. Escreva uma mensagem se apresentando para o
            moderador — quanto mais detalhes, maiores as chances de aprovação.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Ex: Oi! Me chamo João, tenho 28 anos e jogo futebol de campo há 10 anos. Vi que vocês jogam aos sábados perto de casa e adoraria participar!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={500}
              className="resize-none text-sm"
            />
            <div className="flex justify-between px-0.5">
              <p className="text-muted-foreground text-xs">
                {charCount < 10
                  ? `Mínimo ${10 - charCount} caracteres restantes`
                  : ""}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!isValid || isPending}
            >
              <SendIcon className="h-4 w-4" />
              {isPending ? "Enviando..." : "Enviar solicitação"}
            </Button>
            <Button variant="outline" className="w-full" onClick={onClose}>
              Cancelar
            </Button>
          </form>
        </div>
      }
    />
  );

  return (
    <Sheet
      open={!!group}
      onOpenChange={(open) => {
        if (!open) {
          setMessage("");
          onClose();
        }
      }}
    >
      <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
        <SheetHeader className="mb-4 text-left">
          <div className="mb-1 flex items-center gap-2.5">
            <div className="bg-primary/10 flex size-9 shrink-0 items-center justify-center rounded-xl">
              <LockIcon className="text-primary h-4 w-4" />
            </div>
            <div>
              <SheetTitle className="text-base">Solicitar entrada</SheetTitle>
              <SheetDescription className="text-xs">
                {group?.name}
              </SheetDescription>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Este é um grupo privado. Escreva uma mensagem se apresentando para o
            moderador — quanto mais detalhes, maiores as chances de aprovação.
          </p>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Textarea
              placeholder="Ex: Oi! Me chamo João, tenho 28 anos e jogo futebol de campo há 10 anos. Vi que vocês jogam aos sábados perto de casa e adoraria participar!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={500}
              className="resize-none text-sm"
              disabled={isPending}
              autoFocus
            />
            <div className="flex justify-between px-0.5">
              <p className="text-muted-foreground text-xs">
                {charCount < 10
                  ? `Mínimo ${10 - charCount} caracteres restantes`
                  : ""}
              </p>
              <p
                className={`text-xs tabular-nums ${charCount > 450 ? "text-destructive" : "text-muted-foreground"}`}
              >
                {charCount}/500
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isPending}
          >
            <SendIcon className="h-4 w-4" />
            {isPending ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
