import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { MailboxIcon } from "lucide-react";

export const EmptyRequestList = () => {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MailboxIcon />
        </EmptyMedia>
        <EmptyTitle>Nenhuma solicitação pendente</EmptyTitle>
        <EmptyDescription>
          Não há solicitações de novos membros no momento.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
