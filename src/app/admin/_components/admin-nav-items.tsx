"use client";

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SparklesIcon,
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
  {
    title: "Novidades",
    href: "/admin/announcements",
    icon: SparklesIcon,
  },
];

export function AdminNavItems() {
  const pathname = usePathname();

  return (
    <>
      {adminNavItems.map((section) => (
        <SidebarGroupContent key={section.title}>
          <SidebarMenu>
            {section.href ? (
              <SidebarMenuItem className="items-center">
                <SidebarMenuButton
                  asChild
                  isActive={pathname === section.href}
                  tooltip={section.title}
                >
                  <Link href={section.href} className="mx-auto items-center">
                    <section.icon className="h-4 w-4" />
                    <span>{section.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : null}
          </SidebarMenu>
        </SidebarGroupContent>
      ))}
    </>
  );
}
