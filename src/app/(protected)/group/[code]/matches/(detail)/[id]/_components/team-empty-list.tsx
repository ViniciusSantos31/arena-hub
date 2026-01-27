import { CardContent } from "@/components/ui/card";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ShuffleIcon } from "lucide-react";

export const TeamEmptyList = () => {
  return (
    <CardContent className="space-y-4">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant={"icon"}>
            <ShuffleIcon />
          </EmptyMedia>
          <EmptyTitle>Ainda não há equipes</EmptyTitle>
          <EmptyDescription>
            As equipes serão exibidas aqui assim que o sorteio for realizado.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </CardContent>
  );
};
