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

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefix?: boolean;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const adminNavSections: NavSection[] = [
  {
    label: "Visão geral",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    label: "Operações",
    items: [
      { title: "Usuários", href: "/admin/users", icon: UsersIcon, matchPrefix: true },
      { title: "Grupos", href: "/admin/groups", icon: UsersRoundIcon, matchPrefix: true },
      { title: "Partidas", href: "/admin/matches", icon: SwordsIcon, matchPrefix: true },
    ],
  },
  {
    label: "Negócio",
    items: [
      { title: "Billing", href: "/admin/billing", icon: CreditCardIcon },
      { title: "Crescimento", href: "/admin/growth", icon: TrendingUpIcon },
    ],
  },
  {
    label: "Produto",
    items: [
      { title: "Feedbacks", href: "/admin/feedbacks", icon: MessageSquareIcon },
      { title: "Moderação", href: "/admin/moderation", icon: ShieldIcon },
      { title: "Tutorial", href: "/admin/tutorial", icon: BookOpenIcon },
      { title: "Novidades", href: "/admin/announcements", icon: SparklesIcon },
    ],
  },
];

function isNavItemActive(pathname: string, item: NavItem) {
  if (item.matchPrefix) {
    return pathname.startsWith(item.href);
  }
  return pathname === item.href;
}

export function AdminNavItems() {
  const pathname = usePathname();

  return (
    <>
      {adminNavSections.map((section) => (
        <SidebarGroup key={section.label}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {section.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isNavItemActive(pathname, item)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
