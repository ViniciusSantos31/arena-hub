import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Users2Icon } from "lucide-react";
import Link from "next/link";

export const EmptyList = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users2Icon />
        </EmptyMedia>
        <EmptyTitle>Nenhum grupo encontrado</EmptyTitle>
        <EmptyDescription>
          Não há grupos disponíveis no momento. Crie um novo grupo para começar.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center gap-2">
        <Button asChild>
          <Link href="/group/create">Criar grupo</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
};
