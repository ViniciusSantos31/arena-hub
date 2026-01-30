"use client";

import { BugIcon, GraduationCapIcon } from "lucide-react";
import { NavSidebar } from "./nav-sidebar";

const options = {
  settings: [
    // {
    //   title: "Configurações da conta",
    //   url: "/settings/account",
    //   icon: SettingsIcon,
    // },
    // {
    //   title: "Ajuda e feedback",
    //   url: "/settings/help",
    //   icon: HelpCircleIcon,
    // },
    // {
    //   title: "Sobre",
    //   url: "/settings/about",
    //   icon: InfoIcon,
    // },
    {
      title: "Entenda o App",
      url: "/learn-more",
      icon: GraduationCapIcon,
    },
    {
      title: "Reporte um problema",
      url: "https://forms.gle/3fdBhX9aRTDskp4eA",
      target: "_blank",
      icon: BugIcon,
    },
  ],
};

export const NavSettings = () => {
  return <NavSidebar title="Outros" items={options.settings} />;
};
