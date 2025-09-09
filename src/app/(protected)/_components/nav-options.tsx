"use client";

import {
  Globe2Icon,
  PlusCircleIcon,
  StarsIcon,
  Users2Icon,
} from "lucide-react";
import { NavSidebar } from "./nav-sidebar";

const options = {
  navMain: [
    {
      title: "Obter Pro",
      url: "#",
      icon: StarsIcon,
    },
    {
      title: "Encontre sua turma",
      url: "/feed",
      icon: Globe2Icon,
    },
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
  ],
};

export const NavOptions = () => {
  return (
    <>
      <NavSidebar items={options.navMain} />
      <NavSidebar items={options.navGroups} />
    </>
  );
};
