import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SearchIcon } from "lucide-react";

export function DiscoverEmptyList() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={"icon"}>
          <SearchIcon className="text-primary h-5 w-5" />
        </EmptyMedia>
        <EmptyTitle>Nenhum jogador disponível</EmptyTitle>
        <EmptyDescription>
          Quando jogadores ativarem &quot;Procurando grupo&quot; no perfil, eles
          aparecerão aqui.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
