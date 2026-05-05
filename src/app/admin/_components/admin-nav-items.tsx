"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Grupos",
    href: "/admin/groups",
    icon: UsersRoundIcon,
  },
  {
    title: "Feedbacks",
    href: "/admin/feedbacks",
    icon: MessageSquareIcon,
  },
  // {
  //   title: "Partidas",
  //   href: "/admin/matches",
  //   icon: SwordsIcon,
  // },
  {
    title: "Tutorial",
    href: "/admin/tutorial",
    icon: BookOpenIcon,
  },
];

export function AdminNavItems() {
  const pathname = usePathname();

  return (
    <>
      {adminNavItems.map((section) => (
        <SidebarGroup key={section.title}>
          <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.href ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === section.href}
                    tooltip={section.title}
                  >
                    <Link href={section.href}>
                      <section.icon className="h-4 w-4" />
                      <span>{section.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
