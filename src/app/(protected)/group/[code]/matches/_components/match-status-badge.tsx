import { Badge } from "@/components/ui/badge";
import { Status } from "../(detail)/[id]/page";

export const MatchStatusBadge = ({ status }: { status: Status }) => {
  const matchStatusConfig: Record<Status, { label: string; color: string }> = {
    open_registration: { label: "Inscrições Abertas", color: "bg-primary" },
    closed_registration: {
      label: "Inscrições Fechadas",
      color: "bg-secondary text-secondary-foreground",
    },
    completed: { label: "Concluída", color: "bg-blue-500 text-white" },
    scheduled: { label: "Agendada", color: "bg-purple-500 text-white" },
    team_sorted: {
      label: "Times Sorteados",
      color: "bg-indigo-500 text-white",
    },
    cancelled: {
      label: "Cancelada",
      color: "bg-destructive text-background",
    },
  };

  return (
    <Badge className={matchStatusConfig[status].color}>
      {matchStatusConfig[status].label}
    </Badge>
  );
};
