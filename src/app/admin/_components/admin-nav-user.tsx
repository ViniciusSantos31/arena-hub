import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { ShieldCheckIcon } from "lucide-react";

export function AdminNavUser() {
  const session = authClient.useSession();

  const user = session?.data?.user;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:bg-primary/25 group-data-[collapsible=icon]:text-primary group-data-[collapsible=icon]:hover:bg-primary/50 h-12 transition-colors">
          <ShieldCheckIcon />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">
              {user?.name || "Admin"}
            </span>
            <span className="text-muted-foreground truncate text-xs">
              Administrador
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
