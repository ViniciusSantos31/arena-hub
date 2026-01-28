import { getUserMatchPlayer } from "@/actions/match/join";
import { confirmMatchPresence } from "@/actions/match/player";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";
import { queryClient } from "@/lib/react-query";
import { Status } from "@/utils/status";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircleIcon } from "lucide-react";

export const ConfirmPresenceButton = ({
  matchId,
  matchStatus,
}: {
  matchId: string;
  matchStatus: Status;
}) => {
  const { sendEvent } = useWebSocket();

  const { data: player } = useQuery({
    queryKey: ["player", matchId],
    enabled: !!matchId,
    queryFn: async () =>
      getUserMatchPlayer({ matchId }).then((res) => res.data),
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["confirm-presence", matchId],
    mutationFn: async (matchId: string) => {
      await confirmMatchPresence({ matchId });
    },
    onSuccess: () => {
      sendEvent({
        event: "match_participant_joined",
        payload: {
          matchId,
          player: {
            id: player?.id ?? "",
            image: "",
            name: "",
            score: 0,
          },
        },
      });
      queryClient.invalidateQueries({
        predicate(query) {
          return (
            query.queryKey[0] === "players" ||
            query.queryKey[0] === "player" ||
            query.queryKey[0] === "match"
          );
        },
      });
    },
  });

  if (!player || player.confirmed || matchStatus === "closed_registration") {
    return null;
  }

  return (
    <Button
      variant={"outline"}
      disabled={isPending}
      onClick={() => mutate(matchId)}
    >
      <CheckCircleIcon />
      Confirmar presença
    </Button>
  );
};
