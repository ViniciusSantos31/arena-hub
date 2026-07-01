"use client";

import type { AdminUserDetail } from "@/actions/admin/users/detail";
import { setAdminUserEarlyAdopter } from "@/actions/admin/users/set-early-adopter";
import { syncAdminUserSubscription } from "@/actions/admin/users/sync-subscription";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AdminUserActions({
  profile,
  hasSubscription,
}: {
  profile: AdminUserDetail["profile"];
  hasSubscription: boolean;
}) {
  const router = useRouter();
  const [isEarlyAdopter, setIsEarlyAdopter] = useState(profile.isEarlyAdopter);

  useEffect(() => {
    setIsEarlyAdopter(profile.isEarlyAdopter);
  }, [profile.isEarlyAdopter]);

  const earlyAdopterAction = useAction(setAdminUserEarlyAdopter, {
    onSuccess: ({ input }) => {
      toast.success(
        input.isEarlyAdopter
          ? "Early adopter concedido."
          : "Early adopter revogado.",
      );
      router.refresh();
    },
    onError: ({ error }) => {
      setIsEarlyAdopter(profile.isEarlyAdopter);
      toast.error(error.serverError ?? "Não foi possível atualizar o usuário.");
    },
  });

  const syncAction = useAction(syncAdminUserSubscription, {
    onSuccess: () => {
      toast.success("Assinatura sincronizada com o Stripe.");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Não foi possível sincronizar a assinatura.",
      );
    },
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="border-border/60 bg-background/50 flex flex-1 items-center justify-between gap-4 rounded-lg border p-4">
        <div className="min-w-0 space-y-1">
          <Label htmlFor={`early-adopter-${profile.id}`} className="text-sm">
            Early adopter
          </Label>
          <p className="text-muted-foreground text-xs">
            Permite criar até 2 grupos sem assinatura ativa.
          </p>
        </div>
        <Switch
          id={`early-adopter-${profile.id}`}
          checked={isEarlyAdopter}
          disabled={earlyAdopterAction.isExecuting}
          onCheckedChange={(next) => {
            setIsEarlyAdopter(next);
            earlyAdopterAction.execute({
              userId: profile.id,
              isEarlyAdopter: next,
            });
          }}
        />
      </div>

      {hasSubscription ? (
        <Button
          type="button"
          variant="outline"
          disabled={syncAction.isExecuting}
          onClick={() => syncAction.execute({ userId: profile.id })}
          className="shrink-0"
        >
          {syncAction.isExecuting ? "Sincronizando..." : "Sync Stripe"}
        </Button>
      ) : null}
    </div>
  );
}
