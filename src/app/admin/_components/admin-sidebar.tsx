import * as React from "react";

import { AdminNavItems } from "@/app/admin/_components/admin-nav-items";
import { AdminNavUser } from "@/app/admin/_components/admin-nav-user";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

export async function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <AdminNavUser />
      </SidebarHeader>
      <SidebarContent>
        <AdminNavItems />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="p-0">
        <Separator />
        <div className="text-muted-foreground p-4 text-xs">
          Arena Hub Admin v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
