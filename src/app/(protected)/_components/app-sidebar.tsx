"use client";

import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  PieChart,
  Settings2,
  TicketIcon,
  Users2Icon,
} from "lucide-react";
import * as React from "react";

import { GroupSwitcher } from "@/app/(protected)/_components/group-switcher";
import { NavMain } from "@/app/(protected)/_components/nav-main";
import { NavUser } from "@/app/(protected)/_components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMatches } from "./nav-matches";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  groups: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: PieChart,
    },
    {
      title: "Participantes",
      url: "#",
      icon: Users2Icon,
    },
    {
      title: "Convites",
      url: "#",
      icon: TicketIcon,
    },
    {
      title: "Configurações",
      url: "/settings/general",
      icon: Settings2,
      items: [
        {
          title: "Geral",
          url: "#",
        },
        {
          title: "Limites",
          url: "#",
        },
        {
          title: "Pagamentos",
          url: "#",
        },
      ],
    },
  ],
  matches: [
    {
      name: "Futebol dos amigos",
      url: "#",
    },
    {
      name: "Inimigos do vôlei",
      url: "#",
    },
    {
      name: "Ciclismo radical",
      url: "#",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <GroupSwitcher groups={data.groups} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMatches matches={data.matches} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
