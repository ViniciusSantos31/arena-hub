"use client";

import { createRecipient } from "@/actions/payment/create-recipient";
import {
  SettingsAction,
  SettingsSection,
} from "@/app/(protected)/group/[code]/settings/_components/settings-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, PAYMENT_CONFIG } from "@/lib/payments";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  RefreshCwIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

type RecipientStatus = "pending" | "active" | "blocked" | null;

interface BillingSetupCardProps {
  organizationCode: string;
  recipientStatus: RecipientStatus;
}

function StatusBadge({ status }: { status: RecipientStatus }) {
  if (status === "active") {
    return (
      <Badge className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
        <CheckCircle2Icon />
        Conta ativa — você pode criar partidas pagas
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge className="flex items-center gap-2 rounded-full bg-yellow-300 px-3 py-1.5 text-sm font-medium text-yellow-900">
        <AlertCircleIcon />
        Cadastro pendente — conclua o onboarding no Stripe
      </Badge>
    );
  }

  if (status === "blocked") {
    return (
      <Badge
        variant={"destructive"}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
      >
        <AlertCircleIcon />
        Conta bloqueada — entre em contato com o suporte
      </Badge>
    );
  }

  return null;
}

export function BillingSetupCard({
  organizationCode,
  recipientStatus,
}: BillingSetupCardProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const createRecipientAction = useAction(createRecipient, {
    onSuccess: ({ data }) => {
      if (data?.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    },
    onError: ({ error }) => {
      toast.error(
        error.serverError ??
          "Não foi possível iniciar o cadastro. Tente novamente.",
      );
    },
  });

  useEffect(() => {
    const success = searchParams.get("success");
    const refresh = searchParams.get("refresh");

    if (success === "1") {
      toast.success(
        "Cadastro concluído! Assim que aprovado, você poderá criar partidas pagas.",
      );
      router.replace(`/group/${organizationCode}/settings/billing`);
    } else if (refresh === "1") {
      toast.warning(
        "Seu cadastro expirou. Clique em configurar para reiniciar.",
      );
      router.replace(`/group/${organizationCode}/settings/billing`);
    }
  }, [organizationCode, router, searchParams]);

  const handleSetup = () => {
    createRecipientAction.execute({ organizationCode });
  };

  const platformFeePercent = PAYMENT_CONFIG.PLATFORM_FEE_RATE * 100;
  const gatewayFeePercent = PAYMENT_CONFIG.GATEWAY_FEE_RATE * 100;
  const gatewayFeeFixed = formatBRL(PAYMENT_CONFIG.GATEWAY_FEE_FIXED * 100);
  return (
    <div className="space-y-4">
      <SettingsSection
        title="Recebimentos"
        description="Configure sua conta para receber os pagamentos das partidas diretamente via Stripe Connect."
      >
        <div className="space-y-6">
          {recipientStatus && <StatusBadge status={recipientStatus} />}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="bg-muted/50 flex flex-col justify-center space-y-1 rounded-lg p-4 text-center">
              <p className="text-muted-foreground mt-1 text-xs">
                Comissão da plataforma
              </p>
              <p className="text-2xl font-bold">{platformFeePercent}%</p>
            </div>
            <div className="bg-muted/50 flex flex-col items-center justify-center space-y-1 rounded-lg p-4 text-center">
              <p className="text-muted-foreground mt-1 text-xs">
                Taxa do gateway
              </p>
              <span className="inline-flex gap-2 text-2xl font-bold">
                <p className="flex flex-col items-center">
                  {gatewayFeeFixed}
                  <span className="text-muted-foreground text-xs">
                    por transação
                  </span>
                </p>
                <p>+ {gatewayFeePercent}%</p>
              </span>
            </div>
            <div className="bg-muted/50 flex flex-col justify-center space-y-1 rounded-lg p-4 text-center">
              <p className="text-muted-foreground mt-1 text-xs">
                Você recebe (aprox.)
              </p>
              <p className="text-2xl font-bold">
                {100 - platformFeePercent - gatewayFeePercent}%
              </p>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            Os valores ficam em escrow (reservados) durante a partida e são
            liberados automaticamente para sua conta ao marcar a partida como
            concluída. Em caso de cancelamento, os jogadores são reembolsados
            integralmente.
          </p>

          {!recipientStatus && (
            <SettingsAction
              title="Configurar recebimentos"
              description="Crie sua conta no Stripe para começar a receber pagamentos."
              actionLabel="Configurar agora"
              loading={createRecipientAction.isExecuting}
              onAction={handleSetup}
            />
          )}

          {recipientStatus === "pending" && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex flex-col space-y-1">
                <h4 className="font-medium">Concluir cadastro</h4>
                <p className="text-muted-foreground text-sm">
                  Você iniciou o cadastro mas ainda não o concluiu.
                </p>
              </div>
              <Button
                onClick={handleSetup}
                disabled={createRecipientAction.isExecuting}
                variant="outline"
              >
                {createRecipientAction.isExecuting ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLinkIcon className="h-4 w-4" />
                )}
                {createRecipientAction.isExecuting
                  ? "Aguarde..."
                  : "Continuar cadastro"}
              </Button>
            </div>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}
