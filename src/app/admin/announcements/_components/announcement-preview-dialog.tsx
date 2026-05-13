"use client";

import { ResponsiveDialog } from "@/components/responsive-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpenIcon,
  EyeIcon,
  SparklesIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Sparkles: SparklesIcon,
  Users: UsersIcon,
  BookOpen: BookOpenIcon,
};

function resolveIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || SparklesIcon;
}

type AnnouncementPreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: string;
  dismissButtonLabel: string;
};

export function AnnouncementPreviewDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  dismissButtonLabel,
}: AnnouncementPreviewDialogProps) {
  const Icon = resolveIcon(icon);
  const label = dismissButtonLabel?.trim() || "É isso aí ✨";

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Preview da novidade"
      description="Exatamente como o usuário verá o modal"
      icon={EyeIcon}
      contentClassName="p-0"
      content={
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col gap-2 pt-2">
            <Badge className="mx-auto">Novidade!</Badge>
            <div className="bg-primary/10 mx-auto flex size-20 items-center justify-center rounded-full p-2">
              <Icon className="text-primary size-10" />
            </div>
            <div className="space-y-1">
              <h3 className="mb-2 text-center text-lg font-black">
                {title || (
                  <span className="text-muted-foreground italic">
                    Título da novidade
                  </span>
                )}
              </h3>
              <p className="border-y px-4 py-4 font-medium whitespace-pre-wrap text-wrap">
                {description || (
                  <span className="text-muted-foreground italic">
                    Descrição da novidade…
                  </span>
                )}
              </p>
            </div>
          </div>
          <footer className="flex gap-2 px-4 pb-2">
            <Button
              type="button"
              variant="outline"
              className="ml-auto"
              onClick={() => onOpenChange(false)}
            >
              {label}
            </Button>
          </footer>
        </div>
      }
    />
  );
}
