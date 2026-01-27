import { matchStatusEnum } from "@/db/schema/match";

export type Status = (typeof matchStatusEnum.enumValues)[number];

export const getStatusLabel = (status: Status = "open_registration") => {
  const statusLabels: Record<Status, string> = {
    scheduled: "Agendado",
    open_registration: "Inscrição Aberta",
    closed_registration: "Inscrição Fechada",
    team_sorted: "Times Definidos",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return statusLabels[status];
};
