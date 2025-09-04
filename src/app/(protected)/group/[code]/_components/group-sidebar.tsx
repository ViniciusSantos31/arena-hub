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
  PieChartIcon,
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
      variant="floating"
      className="absolute top-4 right-4 max-h-screen w-[calc(var(--sidebar-width-icon)+1px)]! pr-0"
      {...props}
    >
      <SidebarContent>
        <SidebarGroup className="pr-0">
          <SidebarMenu>
            <Tooltip content="Dashboard">
              <SidebarMenuItem>
                <SidebarMenuButton className="items-center justify-center">
                  <PieChartIcon />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
            <Tooltip content="Membros">
              <SidebarMenuItem>
                <SidebarMenuButton className="items-center justify-center">
                  <Users2Icon />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
            <Tooltip content="Partidas">
              <SidebarMenuItem>
                <SidebarMenuButton className="items-center justify-center">
                  <Gamepad2Icon />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
            <Tooltip content="Classificações">
              <SidebarMenuItem>
                <SidebarMenuButton className="items-center justify-center">
                  <Medal />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Tooltip>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pr-0">
        <SidebarMenu>
          <Tooltip content="Configurações do grupo">
            <SidebarMenuItem>
              <SidebarMenuButton className="items-center justify-center">
                <Settings2Icon />
                <span className="sr-only">Configurações do grupo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Tooltip>
          <Tooltip content="Sair do grupo">
            <SidebarMenuItem>
              <SidebarMenuButton className="text-destructive hover:bg-destructive/10 hover:text-destructive items-center justify-center">
                <LogOutIcon />
                <span className="sr-only">Sair do grupo</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Tooltip>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
