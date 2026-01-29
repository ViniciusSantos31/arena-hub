import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ShuffleIcon } from "lucide-react";

export const EmptyTeamList = () => {
  return (
    <Empty className="h-[300px] border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <ShuffleIcon />
        </EmptyMedia>
        <EmptyTitle>Ainda não há equipes</EmptyTitle>
        <EmptyDescription>
          Informe o número de equipes e sorteie os jogadores para começar a
          organizar os times.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
