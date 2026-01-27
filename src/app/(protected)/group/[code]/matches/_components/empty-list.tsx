import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PiSoccerBall } from "react-icons/pi";
import { CreateMatchDialog } from "./create-match-modal";

export const EmptyList = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PiSoccerBall />
        </EmptyMedia>
        <EmptyTitle>Nenhuma partida encontrada</EmptyTitle>
        <EmptyDescription>
          Não há partidas disponíveis no momento. Crie uma nova partida para
          começar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <CreateMatchDialog>
          <Button asChild>Criar partida</Button>
        </CreateMatchDialog>
      </EmptyContent>
    </Empty>
  );
};
