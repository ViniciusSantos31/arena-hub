"use client";

import { shouldShowFeedbackPopup } from "@/actions/feedback/should-show";
import { authClient } from "@/lib/auth-client";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import { FeedbackDialog } from "./feedback-dialog";

const DISMISS_DAYS = 30;

function getDismissKey(userId: string) {
  return `feedback-popup-dismissed:${userId}`;
}

function canShowFromLocalStorage(userId: string) {
  const raw = localStorage.getItem(getDismissKey(userId));
  if (!raw) return true;

  const dismissedAt = Number(raw);
  if (!Number.isFinite(dismissedAt)) return true;

  const ms = DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt > ms;
}

export function FeedbackPopupGate() {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);

  const shouldShowAction = useAction(shouldShowFeedbackPopup);

  const userId = session?.user?.id;

  const shouldCheck = useMemo(() => {
    if (!userId) return false;
    return canShowFromLocalStorage(userId);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (!shouldCheck) return;
    if (shouldShowAction.isExecuting || shouldShowAction.isPending) return;
    if (shouldShowAction.hasSucceeded) return;

    shouldShowAction.execute();
  }, [
    userId,
    shouldCheck,
    shouldShowAction,
    shouldShowAction.isExecuting,
    shouldShowAction.isPending,
    shouldShowAction.hasSucceeded,
  ]);

  useEffect(() => {
    if (!userId) return;
    if (!shouldShowAction.result?.data) return;
    setOpen(true);
  }, [userId, shouldShowAction.result?.data]);

  const handleDismiss = () => {
    if (userId) {
      localStorage.setItem(getDismissKey(userId), String(Date.now()));
    }
    setOpen(false);
  };

  return (
    <FeedbackDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleDismiss();
        else setOpen(true);
      }}
      onSubmitted={() => {
        if (userId) {
          localStorage.setItem(getDismissKey(userId), String(Date.now()));
        }
        setOpen(false);
      }}
    />
  );
}
