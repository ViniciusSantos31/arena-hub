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

type ResponsiveDialogProps = {
  className?: string;
  children?: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  description?: string;
  open?: boolean;
  icon?: LucideIcon;
  asChild?: boolean;
  contentClassName?: string;
  onOpenChange?: (open: boolean) => void;
  showCloseButton?: boolean;
  variant?: "default" | "destructive" | "warning";
};

export type ResponsiveDialogBaseProps = Omit<
  ResponsiveDialogProps,
  "content" | "title" | "description" | "icon" | "variant"
>;

export const ResponsiveDialog = ({
  title,
  icon: Icon,
  description,
  children,
  content,
  onOpenChange,
  open,
  variant = "default",
  className,
  contentClassName,
  asChild = true,
  showCloseButton = true,
}: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const iconBadge = Icon ? (
    <span
      data-slot="icon-badge"
      className={cn(
        "bg-primary/10 text-primary ring-primary/50 flex size-10 shrink-0 items-center justify-center rounded-2xl ring-1",
        variant === "destructive" &&
          "bg-destructive/10 text-destructive ring-destructive/50",
        variant === "warning" &&
          "bg-yellow-500/10 text-yellow-500 ring-yellow-500/50",
      )}
    >
      <Icon className="size-5" />
    </span>
  ) : null;

  if (isMobile) {
    return (
      <Drawer open={open ?? isOpen} onOpenChange={handleOpenChange}>
        {children && (
          <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>
        )}
        <DrawerContent
          data-variant={variant}
          className={cn(
            "border-border/60 bg-background/95 w-full overflow-hidden rounded-t-3xl shadow-2xl backdrop-blur",
            className,
          )}
        >
          {(title || description) && (
            <DrawerHeader className="border-border/60 border-b px-5 pt-3 pb-4 text-left">
              <div className="flex flex-col items-center gap-3">
                {iconBadge}
                <div className="min-w-0 space-y-1">
                  {title && (
                    <DrawerTitle className="text-foreground text-base leading-tight font-semibold tracking-tight">
                      {title}
                    </DrawerTitle>
                  )}
                  {description && (
                    <DrawerDescription className="text-muted-foreground text-sm leading-relaxed text-balance">
                      {description}
                    </DrawerDescription>
                  )}
                </div>
              </div>
            </DrawerHeader>
          )}
          <div
            className={cn(
              "w-full space-y-6 overflow-y-auto px-5 py-5",
              contentClassName,
            )}
          >
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild={asChild}>{children}</DialogTrigger>}
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          "border-border/60 group/dialog-content bg-background/95 flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 text-start shadow-2xl backdrop-blur sm:max-w-md sm:rounded-2xl",
          className,
        )}
      >
        {(title || description) && (
          <DialogHeader className="border-border/60 h-fit border-b px-5 py-5 pr-12 text-left">
            <div className="flex items-start gap-3">
              {iconBadge}
              <div className="min-w-0 space-y-1">
                {title && (
                  <DialogTitle className="text-foreground text-base leading-tight font-semibold tracking-tight">
                    {title}
                  </DialogTitle>
                )}
                {description && (
                  <DialogDescription className="line-clamp-2 text-sm leading-relaxed">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>
        )}
        <div
          className={cn(
            "flex h-full flex-col overflow-y-auto px-5 py-5",
            contentClassName,
          )}
        >
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
