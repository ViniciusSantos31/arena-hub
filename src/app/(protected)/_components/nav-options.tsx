"use client";

import { Globe2Icon, PlusCircleIcon, Users2Icon } from "lucide-react";
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
      title: "Entrar em grupo",
      url: "/group/join",
      icon: Users2Icon,
    },
    {
      title: "Encontre sua turma",
      url: "/feed",
      icon: Globe2Icon,
    },
  ],
};

export const NavOptions = () => {
  return <NavSidebar title="Social" items={options.navGroups} />;
};
