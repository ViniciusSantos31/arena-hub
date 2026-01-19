"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

type ReponsiveModalProps = {
  className?: string;
  children?: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  icon?: LucideIcon;
  onOpenChange?: (open: boolean) => void;
};

export const ResponsiveDialog = ({
  title,
  icon: Icon,
  description,
  children,
  content,
  onOpenChange,
  open,
  className,
}: ReponsiveModalProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  if (isMobile) {
    return (
      <Drawer open={open ?? isOpen} onOpenChange={handleOpenChange}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent className={cn("w-full", className)}>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
            </DrawerTitle>
            <DrawerDescription className="text-start">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="w-full space-y-6 overflow-y-auto px-4 pb-4">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex max-h-[90vh] flex-col overflow-clip px-0 pb-0 sm:max-w-md",
          className,
        )}
      >
        <DialogHeader className="h-fit px-4">
          <DialogTitle className="flex items-center gap-1">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex h-full flex-col overflow-y-auto px-4 pb-4">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
