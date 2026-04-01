"use client";

import { createMembershipPlan } from "@/actions/membership/create-membership-plan";
import { getMembershipPlan } from "@/actions/membership/get-membership-plan";
import {
  SettingsAction,
  SettingsSection,
} from "@/app/(protected)/group/[code]/settings/_components/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL, PAYMENT_CONFIG } from "@/lib/payments";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheckIcon, PencilIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

interface MembershipPlanCardProps {
  organizationCode: string;
}

export function MembershipPlanCard({ organizationCode }: MembershipPlanCardProps) {
  const [editing, setEditing] = useState(false);
  const [priceInput, setPriceInput] = useState("");

  const {
    data: plan,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["membership-plan", organizationCode],
    queryFn: async () =>
      getMembershipPlan({ organizationCode }).then((res) => res?.data ?? null),
  });

  const createPlanAction = useAction(createMembershipPlan, {
    onSuccess: () => {
      toast.success("Plano mensal configurado com sucesso!");
      setEditing(false);
      setPriceInput("");
      refetch();
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Não foi possível configurar o plano. Tente novamente.",
      );
    },
  });

  const handleSave = () => {
    const raw = priceInput.replace(",", ".");
    const value = parseFloat(raw);
    if (isNaN(value) || value <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    const cents = Math.round(value * 100);
    if (cents < PAYMENT_CONFIG.MIN_SUBSCRIPTION_CENTS) {
      toast.error(`Valor mínimo: ${formatBRL(PAYMENT_CONFIG.MIN_SUBSCRIPTION_CENTS)}`);
      return;
    }
    if (cents > PAYMENT_CONFIG.MAX_SUBSCRIPTION_CENTS) {
      toast.error(`Valor máximo: ${formatBRL(PAYMENT_CONFIG.MAX_SUBSCRIPTION_CENTS)}`);
      return;
    }
    createPlanAction.execute({ organizationCode, amountCents: cents });
  };

  return (
    <SettingsSection
      title="Plano Mensal"
      description="Configure uma mensalidade para os membros do grupo. Membros com assinatura ativa ficam isentos de pagar por cada partida."
    >
      {isLoading ? (
        <div className="bg-muted/50 h-16 animate-pulse rounded-lg" />
      ) : plan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <CalendarCheckIcon className="text-primary size-5" />
              <div>
                <p className="font-medium">{formatBRL(plan.amountCents)} / mês</p>
                <p className="text-muted-foreground text-sm">
                  Renovação automática mensal
                </p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Ativo
            </Badge>
          </div>

          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(true);
                setPriceInput((plan.amountCents / 100).toFixed(2));
              }}
            >
              <PencilIcon className="size-4" />
              Alterar valor
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">R$</span>
              <Input
                type="number"
                min={PAYMENT_CONFIG.MIN_SUBSCRIPTION_CENTS / 100}
                max={PAYMENT_CONFIG.MAX_SUBSCRIPTION_CENTS / 100}
                step="0.01"
                placeholder="0,00"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="max-w-[120px]"
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={createPlanAction.isExecuting}
              >
                {createPlanAction.isExecuting ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </div>
          )}

          <p className="text-muted-foreground text-xs">
            Ao alterar o valor, assinantes existentes continuarão pagando o valor
            antigo até o final do ciclo vigente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {!editing ? (
            <SettingsAction
              title="Configurar mensalidade"
              description="Defina o valor mensal que os membros pagarão para ter acesso ilimitado às partidas pagas."
              actionLabel="Configurar agora"
              onAction={() => setEditing(true)}
            />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">R$</span>
                <Input
                  type="number"
                  min={PAYMENT_CONFIG.MIN_SUBSCRIPTION_CENTS / 100}
                  max={PAYMENT_CONFIG.MAX_SUBSCRIPTION_CENTS / 100}
                  step="0.01"
                  placeholder="0,00"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  className="max-w-[120px]"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={createPlanAction.isExecuting}
                >
                  {createPlanAction.isExecuting ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Mínimo: {formatBRL(PAYMENT_CONFIG.MIN_SUBSCRIPTION_CENTS)} &mdash; Máximo:{" "}
                {formatBRL(PAYMENT_CONFIG.MAX_SUBSCRIPTION_CENTS)}
              </p>
            </div>
          )}
        </div>
      )}
    </SettingsSection>
  );
}
