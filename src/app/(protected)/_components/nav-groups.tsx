import { listMyGroups } from "@/actions/group/list-my-groups";
import { NavSidebar } from "./nav-sidebar";

export async function NavGroups() {
  const response = await listMyGroups();
  if (!response?.data) return null;

  const groups = response.data;

  return (
    <NavSidebar
      items={
        groups.map((group) => ({
          title: group?.name ?? "Grupo sem nome",
          url: `/group/${group?.code}`,
          logo: group?.logo ?? undefined,
        })) ?? []
      }
    />
  );
}
