"use client";

import {
  Globe2Icon,
  HelpCircleIcon,
  InfoIcon,
  PlusCircleIcon,
  SettingsIcon,
  StarsIcon,
  Users2Icon,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/app/(protected)/_components/nav-main";
import { NavUser } from "@/app/(protected)/_components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroups } from "./nav-groups";
import { NavSettings } from "./nav-settings";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    url: "/profile",
  },
  navMain: [
    {
      title: "Obter Pro",
      url: "#",
      icon: StarsIcon,
    },
    {
      title: "Encontre sua turma",
      url: "#",
      icon: Globe2Icon,
    },
  ],
  navGroups: [
    {
      title: "Criar grupo",
      url: "#",
      icon: PlusCircleIcon,
    },
    {
      title: "Entrar em grupo",
      url: "#",
      icon: Users2Icon,
    },
  ],
  groups: [
    {
      name: "Inimigos do volêi",
      url: "#",
    },
  ],
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavGroups groups={data.groups} />
        <NavMain items={data.navMain} />
        <NavMain items={data.navGroups} />
        {/* <NavMain title="Geral" items={data.navMain} /> */}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavSettings items={data.settings} />
      </SidebarFooter>
    </Sidebar>
  );
}
