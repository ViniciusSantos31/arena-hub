"use client";

import { syncPaidCheckoutFromReturn } from "@/actions/match/sync-paid-checkout-return";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { matchDetailQueryKeys } from "../_hooks";

function invalidateMatchDetailQueries() {
  queryClient.invalidateQueries({
    predicate(query) {
      return (
        query.queryKey[0] === matchDetailQueryKeys.all[0] ||
        query.queryKey[0] === "player"
      );
    },
  });
}

export function CheckoutReturnHandler({
  matchId,
  organizationCode,
}: {
  matchId: string;
  organizationCode: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sendEvent } = useWebSocket();

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    const sessionId = searchParams.get("session_id");
    const basePath = `/group/${organizationCode}/matches/${matchId}`;

    if (checkout === "cancel") {
      toast.message("Pagamento não concluído", {
        description: "Você pode gerar um novo link quando quiser.",
      });
      router.replace(basePath, { scroll: false });
      return;
    }

    if (checkout !== "success" || !sessionId) {
      return;
    }

    const dedupeKey = `arena-checkout-sync:${sessionId}`;
    if (typeof window !== "undefined" && sessionStorage.getItem(dedupeKey)) {
      invalidateMatchDetailQueries();
      router.replace(basePath, { scroll: false });
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(dedupeKey, "1");
    }

    void (async () => {
      try {
        const res = await syncPaidCheckoutFromReturn({ matchId, sessionId });
        if (res?.serverError) {
          toast.error(String(res.serverError));
          return;
        }
        const status = res?.data?.status;
        if (status === "confirmed" || status === "already_confirmed") {
          toast.success("Pagamento confirmado. Você está confirmado na partida.");
          sendEvent({
            event: WebSocketMessageType.MATCH_PARTICIPANT_JOINED,
            payload: {
              matchId,
              player: {
                id: "",
                image: "",
                name: "",
                score: 0,
              },
            },
          });
        } else if (status === "not_ready") {
          toast.message("Processando pagamento…", {
            description: "Aguarde alguns segundos ou atualize a página.",
          });
        }
      } catch {
        toast.error("Não foi possível confirmar o pagamento.");
      } finally {
        invalidateMatchDetailQueries();
        router.replace(basePath, { scroll: false });
      }
    })();
  }, [matchId, organizationCode, router, searchParams, sendEvent]);

  return null;
}
