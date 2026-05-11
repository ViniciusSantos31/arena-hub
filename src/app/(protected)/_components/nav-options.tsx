"use client";

import { PlusCircleIcon, UsersRoundIcon } from "lucide-react";
import { NavSidebar } from "./nav-sidebar";

const options = {
  navMain: [
    // {
    //   title: "Obter Pro",
    //   url: "#",
    //   icon: StarsIcon,
    // },
  ],
  navGroups: [
    {
      title: "Criar grupo",
      url: "/group/create",
      icon: PlusCircleIcon,
    },
    {
      title: "Vitrine",
      url: "/discover",
      icon: UsersRoundIcon,
    },
  ],
};

export const NavOptions = () => {
  return <NavSidebar title="Social" items={options.navGroups} />;
};
