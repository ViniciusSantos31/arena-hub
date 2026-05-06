"use client";

import {
  getNextFeatureAnnouncementForUser,
  markFeatureAnnouncementSeen,
} from "@/actions/feature-announcements/user";
import { DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL } from "@/lib/feature-announcement-defaults";
import { queryClient } from "@/lib/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BookOpenIcon,
  SparklesIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

const ICONS: Record<string, LucideIcon> = {
  Sparkles: SparklesIcon,
  Users: UsersIcon,
  BookOpen: BookOpenIcon,
};

function resolveIcon(name: string | null | undefined): LucideIcon {
  return (name && ICONS[name]) || SparklesIcon;
}

export function FeatureAnnouncementGate() {
  const [open, setOpen] = useState(false);

  const { data: nextAnnouncement } = useQuery({
    queryKey: ["feature-announcement", "next"],
    queryFn: async () => {
      const result = await getNextFeatureAnnouncementForUser();
      return result.data ?? null;
    },
  });

  useEffect(() => {
    setOpen(Boolean(nextAnnouncement));
  }, [nextAnnouncement]);

  const { mutateAsync: markSeen, isPending: markSeenIsPending } = useMutation({
    mutationKey: ["feature-announcement", "mark-seen"],
    mutationFn: async (announcementId: string) => {
      await markFeatureAnnouncementSeen({ announcementId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feature-announcement", "next"],
      });
    },
  });

  const Icon = useMemo(
    () => resolveIcon(nextAnnouncement?.icon),
    [nextAnnouncement?.icon],
  );

  const dismissLabel =
    nextAnnouncement?.dismissButtonLabel?.trim() ||
    DEFAULT_FEATURE_ANNOUNCEMENT_DISMISS_LABEL;

  const handleClose = async () => {
    if (!nextAnnouncement?.id) return;
    await markSeen(nextAnnouncement.id).catch(() => {});
    setOpen(false);
  };

  if (!nextAnnouncement) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) void handleClose();
        else setOpen(true);
      }}
    >
      <DialogContent className="px-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{nextAnnouncement.title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col gap-2 pt-2">
            <Badge className="mx-auto">Novidade!</Badge>
            <div className="bg-primary/10 mx-auto flex size-20 items-center justify-center rounded-full p-2">
              <Icon className="text-primary size-10" />
            </div>
            <div className="space-y-1">
              <h3 className="mb-2 text-center text-lg font-black">
                {nextAnnouncement.title}
              </h3>
              <p className="border-y px-4 py-4 font-medium text-wrap whitespace-pre-wrap">
                {nextAnnouncement.description}
              </p>
            </div>
          </div>
          <footer className="flex gap-2 px-4 pb-2">
            <Button
              type="button"
              variant="outline"
              className="ml-auto"
              onClick={() => void handleClose()}
              disabled={markSeenIsPending}
            >
              {dismissLabel}
            </Button>
          </footer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
