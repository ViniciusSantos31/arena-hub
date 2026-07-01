"use client";

import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BookOpenIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
  TrendingUpIcon,
  UsersIcon,
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
    title: "Usuários",
    href: "/admin/users",
    icon: UsersIcon,
  },
  {
    title: "Grupos",
    href: "/admin/groups",
    icon: UsersRoundIcon,
  },
  {
    title: "Billing",
    href: "/admin/billing",
    icon: CreditCardIcon,
  },
  {
    title: "Crescimento",
    href: "/admin/growth",
    icon: TrendingUpIcon,
  },
  {
    title: "Feedbacks",
    href: "/admin/feedbacks",
    icon: MessageSquareIcon,
  },
  {
    title: "Moderação",
    href: "/admin/moderation",
    icon: ShieldIcon,
  },
  {
    title: "Partidas",
    href: "/admin/matches",
    icon: SwordsIcon,
  },
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
        <SidebarGroupContent key={section.title} className="h-full">
          <SidebarMenu className="h-full">
            {section.href ? (
              <SidebarMenuItem className="items-center">
                <SidebarMenuButton
                  asChild
                  isActive={
                    section.href === "/admin/users"
                      ? pathname.startsWith("/admin/users")
                      : section.href === "/admin/matches"
                        ? pathname.startsWith("/admin/matches")
                        : section.href === "/admin/groups"
                          ? pathname.startsWith("/admin/groups")
                          : pathname === section.href
                  }
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
