"use client";

import { getUserMatchPlayer } from "@/actions/match/join";
import { queryClient } from "@/lib/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { matchDetailQueryKeys } from "../_hooks";

interface PaymentReturnHandlerProps {
  matchId: string;
}

/**
 * Lida com o retorno do Stripe Checkout após pagamento de partida.
 * Se ?payment=success, exibe toast e faz polling até o webhook
 * criar o player record no banco.
 */
export function PaymentReturnHandler({ matchId }: PaymentReturnHandlerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment !== "success" || handledRef.current) return;
    handledRef.current = true;

    // Remove o param da URL sem recarregar a página
    const url = new URL(window.location.href);
    url.searchParams.delete("payment");
    router.replace(url.pathname + url.search, { scroll: false });

    toast.info("Pagamento recebido! Confirmando sua vaga...");

    const invalidate = () => {
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === matchDetailQueryKeys.all[0] ||
            query.queryKey[0] === "player"
          );
        },
      });
    };

    // Poll até o webhook criar o player record
    pollingRef.current = setInterval(async () => {
      const result = await getUserMatchPlayer({ matchId });
      if (result?.data) {
        clearInterval(pollingRef.current!);
        clearTimeout(timeoutRef.current!);
        invalidate();
        toast.success("Pagamento confirmado! Sua vaga está garantida.");
      }
    }, 2000);

    timeoutRef.current = setTimeout(() => {
      clearInterval(pollingRef.current!);
      invalidate();
      toast.success("Pagamento autorizado! Sua vaga será confirmada em breve.");
    }, 30000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
