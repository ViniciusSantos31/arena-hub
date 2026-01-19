"use client";

import { sortTeams } from "@/actions/team/sort";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { queryClient } from "@/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { DicesIcon, ShuffleIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useMemberStore } from "../../../../_store/group";
import { useMatch } from "../_hooks/useMatch";

export const ShuffleTeamsButton = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const { data: match } = useMatch();
  const memberStore = useMemberStore();

  const methods = useForm({
    defaultValues: { nTeams: 2 },
  });

  const teamListCard = document.getElementById("team-list-card");

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["shuffle-teams"],
    mutationFn: async ({
      organizationId,
      matchId,
      nTeams,
    }: {
      organizationId: string;
      matchId: string;
      nTeams: number;
    }) =>
      await sortTeams({
        matchId,
        organizationId,
        nTeams,
      }),
    onSuccess: (data) => {
      setModalIsOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["match", match?.id],
      });
      queryClient.setQueryData(["teams", match?.id], data.data);
      if (teamListCard) {
        teamListCard.scrollIntoView({ behavior: "smooth" });
      }
    },
  });

  const matchStatus = match?.status;
  const showShuffleTeamsButton = matchStatus === "closed_registration";

  const handleShuffleTeams = async ({ nTeams }: { nTeams: number }) => {
    try {
      await mutateAsync({
        matchId: match?.id || "",
        organizationId: memberStore.member?.organizationId || "",
        nTeams,
      });
      toast.success("Sorteio dos times realizado com sucesso.");
    } catch {
      toast.error("Erro ao realizar o sorteio dos times.");
    }
  };

  if (!showShuffleTeamsButton) {
    return null;
  }

  return (
    <Fragment>
      <Button variant="outline" onClick={() => setModalIsOpen(true)}>
        <ShuffleIcon />
        <span className="hidden @md:block">Realizar sorteio</span>
        <span className="@md:hidden">Sortear</span>
      </Button>
      <ResponsiveDialog
        title="Sortear times"
        icon={DicesIcon}
        open={modalIsOpen}
        onOpenChange={(open) => setModalIsOpen(open)}
        content={
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(handleShuffleTeams)}>
              <InputField
                name="nTeams"
                label="Quantidade de times"
                type="number"
                description="Defina em quantos times os jogadores serão divididos."
              />
              <Button
                type="submit"
                disabled={isPending}
                className="mt-4 w-full"
              >
                Sortear times
              </Button>
            </form>
          </Form>
        }
      />
    </Fragment>
  );
};
