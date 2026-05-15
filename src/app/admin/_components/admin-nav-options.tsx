"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";

export const AdminNavOptions = () => {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        next: { revalidate: 0 },
      },
    });
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={handleLogout}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <LogOutIcon />
            <span>Sair</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};
