import * as React from "react";

import { NavUser } from "@/app/(protected)/_components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroups } from "./nav-groups";
import { NavLogout } from "./nav-logout";
import { NavOptions } from "./nav-options";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavGroups />
        <NavOptions />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="p-0">
        <Separator />
        <NavLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
