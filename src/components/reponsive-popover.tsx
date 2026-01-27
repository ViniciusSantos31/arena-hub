"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

type ReponsiveModalProps = {
  className?: string;
  children?: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  icon?: LucideIcon;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

export const ResponsivePopover = ({
  title,
  icon: Icon,
  description,
  children,
  content,
  onOpenChange,
  open,
  disabled = false,
  className,
}: ReponsiveModalProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <Drawer open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
        {children && (
          <DrawerTrigger
            asChild
            className="flex min-w-0 flex-col"
            disabled={disabled}
          >
            {children}
          </DrawerTrigger>
        )}
        <DrawerContent className={className}>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </DrawerTitle>
            <DrawerDescription className="text-start">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-6 overflow-y-auto">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Popover open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <PopoverTrigger
        asChild
        className="flex min-w-0 flex-col"
        disabled={disabled}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "flex max-h-[90vh] flex-col overflow-clip px-0 pb-0 sm:max-w-md",
          className,
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">{content}</div>
      </PopoverContent>
    </Popover>
  );
};
