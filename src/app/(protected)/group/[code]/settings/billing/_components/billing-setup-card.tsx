"use client";

import { createRecipient } from "@/actions/payment/create-recipient";
import {
  SettingsAction,
  SettingsSection,
} from "@/app/(protected)/group/[code]/settings/_components/settings-section";
import { Button } from "@/components/ui/button";
import { PAYMENT_CONFIG } from "@/lib/payments";
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
      <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400">
        <CheckCircle2Icon className="h-4 w-4" />
        Conta ativa — você pode criar partidas pagas
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1.5 text-sm font-medium text-yellow-600 dark:text-yellow-400">
        <AlertCircleIcon className="h-4 w-4" />
        Cadastro pendente — conclua o onboarding no Stripe
      </div>
    );
  }

  if (status === "blocked") {
    return (
      <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400">
        <AlertCircleIcon className="h-4 w-4" />
        Conta bloqueada — entre em contato com o suporte
      </div>
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

  return (
    <div className="space-y-4">
      <SettingsSection
        title="Recebimentos"
        description="Configure sua conta para receber os pagamentos das partidas diretamente via Stripe Connect."
      >
        <div className="space-y-6">
          {recipientStatus && <StatusBadge status={recipientStatus} />}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">{platformFeePercent}%</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Comissão da plataforma
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">2,5%</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Taxa do gateway
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold">
                {100 - platformFeePercent - 2.5}%
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Você recebe (aprox.)
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
