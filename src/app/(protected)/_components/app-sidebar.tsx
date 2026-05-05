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
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NavAdmin } from "./nav-admin";
import { NavGroups } from "./nav-groups";
import { NavHome } from "./nav-home";
import { NavLogout } from "./nav-logout";
import { NavOptions } from "./nav-options";
import { NavSettings } from "./nav-settings";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        <NavHome />
        <NavGroups />
        <NavOptions />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="p-0">
        {session?.user?.email === process.env.ADMIN_EMAIL && <NavAdmin />}
        <NavSettings />
        <Separator />
        <NavLogout />
      </SidebarFooter>
    </Sidebar>
  );
}
