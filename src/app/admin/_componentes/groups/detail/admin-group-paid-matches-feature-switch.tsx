"use client";

import type { AdminGroupDetail } from "@/actions/admin/groups/detail";
import { setAdminGroupPaidMatchesFeature } from "@/actions/admin/groups/set-paid-matches-feature";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { queryClient } from "@/lib/react-query";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AdminGroupPaidMatchesFeatureSwitch({
  group,
}: {
  group: AdminGroupDetail["group"];
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(group.paidMatchesFeatureEnabled);

  useEffect(() => {
    setEnabled(group.paidMatchesFeatureEnabled);
  }, [group.paidMatchesFeatureEnabled]);

  const action = useAction(setAdminGroupPaidMatchesFeature, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group-details", group.code],
      });
      toast.success("Configuração de cobrança do grupo atualizada.");
      router.refresh();
    },
    onError: () => {
      setEnabled(group.paidMatchesFeatureEnabled);
      toast.error("Não foi possível atualizar o recurso.");
    },
  });

  return (
    <div className="border-border/60 bg-background/50 flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="min-w-0 space-y-1">
        <Label htmlFor={`paid-feature-${group.id}`} className="text-sm">
          Partidas pagas e cobrança (Stripe)
        </Label>
        <p className="text-muted-foreground text-xs">
          Quando desligado, o grupo não vê fluxo de pagamento, Connect nem
          isenções. Ligue apenas para grupos que devem usar inscrição paga.
        </p>
      </div>
      <Switch
        id={`paid-feature-${group.id}`}
        checked={enabled}
        disabled={action.isExecuting}
        onCheckedChange={(next) => {
          setEnabled(next);
          action.execute({ code: group.code, enabled: next });
        }}
      />
    </div>
  );
}
