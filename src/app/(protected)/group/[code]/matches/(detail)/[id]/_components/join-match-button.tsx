"use client";

import { getUserMatchPlayer, joinMatch } from "@/actions/match/join";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/react-query";
import { useQuery } from "@tanstack/react-query";
import { PlayIcon, XCircleIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Status } from "../page";

export const JoinMatchButton = ({
  match,
  organizationCode,
}: {
  organizationCode: string;
  match: {
    id: string;
    status: Status;
  };
}) => {
  const { data: player } = useQuery({
    queryKey: ["player", match.id],
    enabled: !!match.id,
    queryFn: async () =>
      getUserMatchPlayer({ matchId: match.id }).then((res) => res.data),
  });

  const joinMatchAction = useAction(joinMatch, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === "players" || query.queryKey[0] === "player"
          );
        },
      });
      if (player) {
        toast.warning("Você saiu da partida!");
        return;
      }
      toast.success("Inscrição realizada com sucesso!");
    },
    onError: () => {
      toast.error("Não foi possível realizar a inscrição na partida.");
    },
  });

  const handleJoinMatch = () => {
    joinMatchAction.execute({
      matchId: match.id,
      organizationCode,
    });
  };

  if (player) {
    return (
      <Button
        className="flex-1 @md:flex-none"
        variant={"outline"}
        onClick={handleJoinMatch}
        disabled={
          match.status !== "open_registration" || joinMatchAction.isExecuting
        }
      >
        <XCircleIcon />
        <span className="hidden @md:block">Sair da Partida</span>
        <span className="@md:hidden">Sair</span>
      </Button>
    );
  }

  return (
    <Button
      disabled={
        match.status !== "open_registration" || joinMatchAction.isExecuting
      }
      className="flex-1 @md:flex-none"
      onClick={handleJoinMatch}
    >
      <PlayIcon />
      <span className="hidden @md:block">Participar da Partida</span>
      <span className="@md:hidden">Participar</span>
    </Button>
  );
};
