import { roleEnum } from "@/db/schema/member";

export type Role = (typeof roleEnum.enumValues)[number];

export const getRoleLabel = (role: Role = "guest") => {
  const roleLabels: Record<Role, string> = {
    owner: "Proprietário",
    admin: "Moderador",
    member: "Membro",
    guest: "Convidado",
  };

  return roleLabels[role];
};
