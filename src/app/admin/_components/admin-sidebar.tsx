"use client";

import * as React from "react";

import { AdminNavItems } from "@/app/admin/_components/admin-nav-items";
import { AdminNavUser } from "@/app/admin/_components/admin-nav-user";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { AdminNavOptions } from "./admin-nav-options";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="overflow-x-clip"
      {...props}
    >
      <SidebarRail />

      <SidebarHeader>
        <AdminNavUser />
      </SidebarHeader>
      <SidebarContent className="mt-4">
        <AdminNavItems />
      </SidebarContent>
      <SidebarContent className="mt-auto justify-end">
        <Separator />
        <div
          className={cn(
            "text-muted-foreground p-4 text-xs text-nowrap",
            !open && "hidden",
          )}
        >
          Arena Hub Admin v1.0
        </div>
        <AdminNavOptions />
      </SidebarContent>
    </Sidebar>
  );
}
