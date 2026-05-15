"use client";

import { createMatchCheckoutSession } from "@/actions/match/create-match-checkout-session";
import { getUserMatchPlayer } from "@/actions/match/join";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { queryClient } from "@/lib/react-query";
import { Status } from "@/utils/status";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ExternalLinkIcon,
  LinkIcon,
  Loader2Icon,
  RefreshCwIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { matchDetailQueryKeys } from "../_hooks";

export function PayWithCheckoutLinkButton({
  matchId,
  matchStatus,
  organizationCode,
  isPaid,
}: {
  matchId: string;
  matchStatus: Status;
  organizationCode: string;
  isPaid: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const { data: player } = useQuery({
    queryKey: ["player", matchId],
    enabled: !!matchId && isPaid,
    queryFn: async () =>
      getUserMatchPlayer({ matchId }).then((res) => res.data),
    refetchInterval: (query) => {
      const p = query.state.data as
        | {
            paymentStatus?: string;
            confirmed?: boolean;
          }
        | null
        | undefined;
      if (isPaid && p && !p.confirmed && p.paymentStatus === "pending") {
        return 3500;
      }
      return false;
    },
  });

  const invalidateMatchQueries = () => {
    queryClient.invalidateQueries({
      predicate(query) {
        return (
          query.queryKey[0] === matchDetailQueryKeys.all[0] ||
          query.queryKey[0] === "player"
        );
      },
    });
  };

  const createSession = useMutation({
    mutationFn: async () => {
      const res = await createMatchCheckoutSession({
        matchId,
        organizationCode,
      });
      if (!res?.data) {
        const msg =
          res?.serverError != null
            ? String(res.serverError)
            : "Não foi possível gerar o link.";
        throw new Error(msg);
      }
      return res.data;
    },
    onSuccess: (data) => {
      setCheckoutUrl(data.checkoutUrl);
      invalidateMatchQueries();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao gerar link de pagamento.");
    },
  });

  useEffect(() => {
    if (open && player?.confirmed) {
      setOpen(false);
      setCheckoutUrl(null);
      invalidateMatchQueries();
    }
  }, [open, player?.confirmed]);

  const copyLink = () => {
    if (!checkoutUrl) return;
    void navigator.clipboard.writeText(checkoutUrl);
    toast.success("Link copiado.");
  };

  /** Esconde o link após pagamento (`paid`) ou presença já confirmada; só aparece com cobrança `pending`. */
  if (
    !isPaid ||
    !player ||
    player.confirmed ||
    matchStatus !== "open_registration" ||
    player.paymentStatus !== "pending"
  ) {
    return null;
  }

  return (
    <>
      <Button
        className="flex-1 @md:flex-none"
        onClick={() => {
          setOpen(true);
          createSession.mutate();
        }}
        disabled={createSession.isPending}
      >
        {createSession.isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <LinkIcon className="size-4" />
        )}
        <span className="hidden @md:block">Link de pagamento</span>
        <span className="@md:hidden">Pagar</span>
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setCheckoutUrl(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Seu link de pagamento</DialogTitle>
            <DialogDescription>
              Este link é <strong>exclusivo para você</strong>. Após o pagamento
              ser concluído com sucesso, ele deixa de poder ser reutilizado. Se o
              link expirar antes de pagar, gere um novo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {createSession.isPending && (
              <div className="flex justify-center py-8">
                <Loader2Icon className="text-muted-foreground size-10 animate-spin" />
              </div>
            )}
            {checkoutUrl && !createSession.isPending && (
              <>
                <div className="flex gap-2">
                  <Input readOnly value={checkoutUrl} className="text-xs" />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyLink}
                    title="Copiar link"
                  >
                    <LinkIcon className="size-4" />
                  </Button>
                </div>
                <Button className="w-full gap-2" asChild>
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="size-4" />
                    Abrir página de pagamento
                  </a>
                </Button>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => createSession.mutate()}
              disabled={createSession.isPending}
            >
              <RefreshCwIcon className="size-4" />
              Novo link
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
