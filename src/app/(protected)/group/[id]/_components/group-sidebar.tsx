import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Tooltip as TooltipComponent,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Gamepad2Icon,
  LogOutIcon,
  Medal,
  Settings2Icon,
  Users2Icon,
} from "lucide-react";

const Tooltip = ({
  children,
  ...props
}: React.ComponentProps<typeof TooltipContent>) => {
  return (
    <TooltipComponent delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="left" {...props}>
        <p className="text-sm">{props.content}</p>
      </TooltipContent>
    </TooltipComponent>
  );
};

export async function GroupSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 h-svh w-[calc(var(--sidebar-width-icon)+1px)]! border-l"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <Tooltip content="Membros">
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users2Icon />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
            <Tooltip content="Partidas">
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Gamepad2Icon />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
            <Tooltip content="Classificações">
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Medal />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Tooltip content="Configurações do grupo">
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings2Icon />
                Configurações do grupo
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Tooltip>
          <Tooltip content="Sair do grupo">
            <SidebarMenuItem>
              <SidebarMenuButton className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOutIcon />
                Sair do grupo
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Tooltip>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
