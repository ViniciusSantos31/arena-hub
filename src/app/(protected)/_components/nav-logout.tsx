"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export const NavLogout = () => {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        next: { revalidate: 0 },
        onSuccess: () => {
          redirect("/auth/sign-in");
        },
      },
    });
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem key={"Sair"}>
          <SidebarMenuButton
            onClick={handleLogout}
            tooltip={"Sair"}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut />
            <span>Sair</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};
