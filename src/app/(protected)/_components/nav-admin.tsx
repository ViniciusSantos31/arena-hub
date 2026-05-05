"use client";

import { LayoutDashboardIcon } from "lucide-react";
import { NavSidebar } from "./nav-sidebar";

export const NavAdmin = () => {
  return (
    <NavSidebar
      title="Sistema"
      items={[
        {
          title: "Painel de administração",
          url: "/admin",
          icon: LayoutDashboardIcon,
          target: "_blank",
        },
      ]}
    />
  );
};
