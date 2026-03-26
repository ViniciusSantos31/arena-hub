"use client";

import { createLoginLink } from "@/actions/payment/create-login-link";
import { SettingsSection } from "@/app/(protected)/group/[code]/settings/_components/settings-section";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

interface BalanceCardProps {
  organizationCode: string;
}

export function BalanceCard({ organizationCode }: BalanceCardProps) {
  const loginLinkAction = useAction(createLoginLink, {
    onSuccess: ({ data }) => {
      if (data?.url) window.open(data.url, "_blank");
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ?? "Não foi possível acessar o painel de saques.",
      );
    },
  });

  const handleWithdraw = () => {
    loginLinkAction.execute({ organizationCode });
  };

  return (
    <SettingsSection
      title="Saldo"
      description="Acompanhe seus recebimentos e solicite saques diretamente pelo Stripe."
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Gerenciar saques</p>
            <p className="text-muted-foreground text-xs">
              Acesse o painel Stripe para transferir o saldo à sua conta
              bancária, ver extrato e configurar saques automáticos.
            </p>
          </div>
          <Button
            onClick={handleWithdraw}
            disabled={loginLinkAction.isExecuting}
            className="ml-4 shrink-0"
          >
            {loginLinkAction.isExecuting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLinkIcon className="h-4 w-4" />
            )}
            {loginLinkAction.isExecuting
              ? "Redirecionando..."
              : "Gerenciar saques"}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
