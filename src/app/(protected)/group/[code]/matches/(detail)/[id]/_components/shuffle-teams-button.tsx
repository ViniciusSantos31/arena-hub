"use client";

import { Button } from "@/components/ui/button";
import { ShuffleIcon } from "lucide-react";
import Link from "next/link";
import { useMatch } from "../_hooks/useMatch";

export const ShuffleTeamsButton = () => {
  const { data: match } = useMatch();

  // const { mutateAsync, isPending } = useMutation({
  //   mutationKey: ["shuffle-teams"],
  //   mutationFn: async ({
  //     organizationId,
  //     matchId,
  //     nTeams,
  //   }: {
  //     organizationId: string;
  //     matchId: string;
  //     nTeams: number;
  //   }) =>
  //     await sortTeams({
  //       matchId,
  //       organizationId,
  //       nTeams,
  //     }),
  //   onSuccess: (data) => {
  //     setModalIsOpen(false);
  //     queryClient.invalidateQueries({
  //       queryKey: ["match", match?.id],
  //     });
  //     queryClient.setQueryData(["teams", match?.id], data.data);
  //     if (teamListCard) {
  //       teamListCard.scrollIntoView({ behavior: "smooth" });
  //     }

  //     sendEvent({
  //       event: WebSocketMessageType.MATCH_STATUS_UPDATED,
  //       payload: {
  //         matchId: match?.id || "",
  //         status: "team_sorted",
  //       },
  //     });
  //   },
  // });

  const matchStatus = match?.status;
  const showShuffleTeamsButton = matchStatus === "closed_registration";

  if (!showShuffleTeamsButton) {
    return null;
  }

  return (
    <Button variant="outline" asChild>
      <Link href={`${match?.id}/sort-teams`}>
        <ShuffleIcon />
        <span className="hidden @md:block">Realizar sorteio</span>
        <span className="@md:hidden">Sortear</span>
      </Link>
    </Button>
  );
};
