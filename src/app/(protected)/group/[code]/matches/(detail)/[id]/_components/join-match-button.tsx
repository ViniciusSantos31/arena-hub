"use client";

import { cancelCharge } from "@/actions/payment/cancel-charge";
import { getUserMatchPlayer, joinMatch } from "@/actions/match/join";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { WebSocketMessageType } from "@/lib/websocket/types";
import { Status } from "@/utils/status";
import { useQuery } from "@tanstack/react-query";
import { PlayIcon, UserRoundMinusIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { matchDetailQueryKeys } from "../_hooks";
import { PaymentCheckoutModal } from "./payment-checkout-modal";

export const JoinMatchButton = ({
  match,
  organizationCode,
}: {
  organizationCode: string;
  match: {
    id: string;
    status: Status;
    isPaid: boolean;
    totalPriceCents: number | null;
    maxPlayers: number;
  };
}) => {
  const [paymentOpen, setPaymentOpen] = useState(false);

  const { data: player } = useQuery({
    queryKey: ["player", match.id],
    enabled: !!match.id,
    queryFn: async () =>
      getUserMatchPlayer({ matchId: match.id }).then((res) => res.data),
  });

  const { sendEvent } = useWebSocket();

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

  // ── Saída de partida paga (cancela PI + remove jogador) ─────────────────
  const cancelChargeAction = useAction(cancelCharge, {
    onSuccess: () => {
      invalidateMatchQueries();
      toast.warning("Você saiu da partida. O valor foi estornado.");
      sendEvent({
        event: WebSocketMessageType.MATCH_PARTICIPANT_LEFT,
        payload: { playerId: player?.userId ?? "", matchId: match.id },
      });
    },
    onError: () => {
      toast.error("Não foi possível sair da partida. Tente novamente.");
    },
  });

  // ── Entrada/saída de partida gratuita ───────────────────────────────────
  const joinMatchAction = useAction(joinMatch, {
    onSuccess: (result) => {
      invalidateMatchQueries();
      const action = result.data?.action;
      if (action === "left") {
        toast.warning("Você saiu da partida!");
        sendEvent({
          event: WebSocketMessageType.MATCH_PARTICIPANT_LEFT,
          payload: { playerId: player?.userId ?? "", matchId: match.id },
        });
        return;
      }
      toast.success("Inscrição realizada com sucesso!");
    },
    onError: () => {
      toast.error("Não foi possível realizar a inscrição na partida.");
    },
  });

  const isDisabled =
    match.status !== "open_registration" ||
    joinMatchAction.isExecuting ||
    cancelChargeAction.isExecuting;

  const pricePerPlayerCents = match.totalPriceCents
    ? Math.ceil(match.totalPriceCents / match.maxPlayers)
    : 0;

  // ── Jogador já está na partida — mostra botão de saída ─────────────────
  if (player) {
    const handleLeave = () => {
      if (match.isPaid) {
        cancelChargeAction.execute({ matchId: match.id });
      } else {
        joinMatchAction.executeAsync({ matchId: match.id, organizationCode }).then(
          (res) => {
            if (res?.data?.action === "left") {
              sendEvent({
                event: WebSocketMessageType.MATCH_PARTICIPANT_LEFT,
                payload: { playerId: player.userId ?? "", matchId: match.id },
              });
            }
          },
        );
      }
    };

    return (
      <Button
        className="flex-1 @md:flex-none"
        variant="outline"
        onClick={handleLeave}
        disabled={isDisabled}
      >
        <UserRoundMinusIcon />
        <span className="hidden @md:block">Sair da Partida</span>
        <span className="@md:hidden">Sair</span>
      </Button>
    );
  }

  // ── Jogador não está na partida — mostra botão de entrada ───────────────
  const handleJoin = () => {
    if (match.isPaid && match.totalPriceCents) {
      setPaymentOpen(true);
      return;
    }

    joinMatchAction.executeAsync({ matchId: match.id, organizationCode }).then(
      (res) => {
        if (res?.data?.action === "joined") {
          sendEvent({
            event: WebSocketMessageType.MATCH_PARTICIPANT_JOINED,
            payload: {
              player: {
                id: res.data.player?.id || "",
                name: res.data.player?.name || "",
                image: res.data.player?.image || null,
                score: res.data.player?.score || 0,
              },
              matchId: match.id,
            },
          });
        }
      },
    );
  };

  return (
    <>
      <Button
        disabled={isDisabled}
        className="flex-1 @md:flex-none"
        onClick={handleJoin}
      >
        <PlayIcon />
        <span className="hidden @md:block">Participar da Partida</span>
        <span className="@md:hidden">Participar</span>
      </Button>

      {match.isPaid && match.totalPriceCents && (
        <PaymentCheckoutModal
          open={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          matchId={match.id}
          organizationCode={organizationCode}
          pricePerPlayerCents={pricePerPlayerCents}
        />
      )}
    </>
  );
};
