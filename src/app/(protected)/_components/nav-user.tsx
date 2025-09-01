"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

const NavUserLoading = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <a href="/profile">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg">
                <div className="bg-muted h-4 w-24 animate-pulse rounded"></div>
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                <div className="bg-muted h-4 w-32 animate-pulse rounded"></div>
              </span>
            </div>
          </SidebarMenuButton>
        </a>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export function NavUser({
  user: _user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    url: string;
  };
}) {
  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return <NavUserLoading />;
  }

  const { user } = session;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <a href="/profile">
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback className="rounded-lg">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
            </div>
          </SidebarMenuButton>
        </a>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
