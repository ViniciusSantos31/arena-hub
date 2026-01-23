"use client";

import { HomeIcon } from "lucide-react";
import { NavSidebar } from "./nav-sidebar";

export const NavHome = () => {
  return (
    <NavSidebar
      items={[
        {
          title: "Início",
          url: "/home",
          icon: HomeIcon,
        },
      ]}
    />
  );
};
