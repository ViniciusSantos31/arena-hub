"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useSelectedLayoutSegments } from "next/navigation";
import { ComponentProps } from "react";

export function NavSidebar({
  title,
  items,
}: {
  title?: string;
  items: {
    title: string;
    url: string;
    target?: ComponentProps<typeof Link>["target"];
    icon?: LucideIcon;
    logo?: string;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { open, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const segments = useSelectedLayoutSegments();

  const currentPath = `/${segments.join("/")}`;

  if (items.length === 0) return null;

  return (
    <SidebarGroup>
      {title && items.length > 0 && (
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton size={"lg"} tooltip={item.title}>
                    {item.icon && <item.icon />}
                    {item.logo && (
                      <AspectRatio ratio={1}>
                        <Image
                          src={item.logo}
                          alt={item.title}
                          width={24}
                          height={24}
                          className={cn(
                            "absolute h-full w-full rounded-sm object-cover",
                          )}
                        />
                      </AspectRatio>
                    )}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem
              key={item.title}
              className={cn(!open && item.logo && "not-last:mb-2")}
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={currentPath.startsWith(item.url)}
                className={cn(
                  item.logo &&
                    !open &&
                    !isMobile &&
                    "overflow-visible p-0! group-data-[collapsible=icon]:p-0!",
                )}
              >
                <Link
                  href={item.url}
                  target={item.target}
                  onClick={() => setOpenMobile(false)}
                >
                  {item.icon && <item.icon />}
                  {item.logo && (
                    <Image
                      src={item.logo}
                      alt={item.title}
                      width={768}
                      height={768}
                      className={cn(
                        "size-6 rounded-sm object-cover",
                        !open && !isMobile && "size-8 rounded-full",
                        currentPath.startsWith(item.url) &&
                          !open &&
                          !isMobile &&
                          "ring-primary ring-offset-sidebar ring-2 ring-offset-2",
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
