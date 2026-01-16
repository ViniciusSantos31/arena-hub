"use client";

import { HelpCircleIcon, InfoIcon, SettingsIcon } from "lucide-react";
import { NavSidebar } from "./nav-sidebar";

const options = {
  settings: [
    {
      title: "Configurações da conta",
      url: "/settings/account",
      icon: SettingsIcon,
    },
    {
      title: "Ajuda e feedback",
      url: "/settings/help",
      icon: HelpCircleIcon,
    },
    {
      title: "Sobre",
      url: "/settings/about",
      icon: InfoIcon,
    },
  ],
};

export const NavSettings = () => {
  return <NavSidebar title="Outros" items={options.settings} />;
};
