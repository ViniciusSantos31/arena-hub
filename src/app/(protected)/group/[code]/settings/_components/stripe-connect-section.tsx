"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, ExternalLinkIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SettingsSection } from "./settings-section";

interface StripeConnectSectionProps {
  id: string;
  group: {
    id: string;
    code: string;
    stripeAccountId: string | null;
  };
}

type AccountStatus = "not_connected" | "pending" | "active";

export function StripeConnectSection({
  id,
  group,
}: StripeConnectSectionProps) {
  const [status, setStatus] = useState<AccountStatus>(
    group.stripeAccountId ? "pending" : "not_connected",
  );
  const [loading, setLoading] = useState(false);

  const checkAccountStatus = useCallback(async () => {
    if (!group.stripeAccountId) return;

    try {
      const res = await fetch(
        `/api/stripe/connect/status?accountId=${group.stripeAccountId}`,
      );
      const data = await res.json();
      setStatus(data.chargesEnabled ? "active" : "pending");
    } catch {
      setStatus("pending");
    }
  }, [group.stripeAccountId]);

  useEffect(() => {
    checkAccountStatus();
  }, [checkAccountStatus]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: group.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao iniciar conexão com Stripe");
      }

      window.location.href = data.url;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao conectar ao Stripe",
      );
      setLoading(false);
    }
  };

  const statusConfig = {
    not_connected: {
      label: "Não conectado",
      icon: <XCircleIcon className="size-4 text-muted-foreground" />,
      badge: (
        <Badge variant="secondary">Não conectado</Badge>
      ),
      description:
        "Conecte sua conta para receber pagamentos das partidas diretamente.",
      actionLabel: "Conectar ao Stripe",
    },
    pending: {
      label: "Cadastro incompleto",
      icon: <Loader2Icon className="size-4 animate-spin text-yellow-500" />,
      badge: <Badge variant="outline" className="border-yellow-500 text-yellow-600">Cadastro pendente</Badge>,
      description:
        "Seu cadastro no Stripe ainda não foi concluído. Clique para continuar o onboarding.",
      actionLabel: "Continuar cadastro",
    },
    active: {
      label: "Ativo",
      icon: <CheckCircle2Icon className="size-4 text-green-500" />,
      badge: <Badge variant="outline" className="border-green-500 text-green-600">Ativo</Badge>,
      description:
        "Sua conta está conectada e pronta para receber pagamentos das partidas.",
      actionLabel: "Gerenciar conta",
    },
  };

  const config = statusConfig[status];

  const handleManage = () => {
    window.open("https://dashboard.stripe.com", "_blank");
  };

  return (
    <SettingsSection
      id={id}
      title="Pagamentos"
      description="Configure o recebimento de valores das partidas pagas via Pix."
      action={config.badge}
    >
      <div className="flex flex-col gap-4">
        <div className="border-border/60 flex items-start gap-3 rounded-xl border p-4">
          <div className="mt-0.5">{config.icon}</div>
          <div className="flex-1 space-y-0.5">
            <p className="text-sm font-medium">{config.label}</p>
            <p className="text-muted-foreground text-xs">{config.description}</p>
          </div>
        </div>

        <div className="flex justify-end">
          {status === "active" ? (
            <Button variant="outline" size="sm" onClick={handleManage}>
              <ExternalLinkIcon className="size-4" />
              Gerenciar no Stripe
            </Button>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={loading}>
              {loading ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <ExternalLinkIcon className="size-4" />
              )}
              {loading ? "Redirecionando..." : config.actionLabel}
            </Button>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          Os pagamentos são processados pelo Stripe. A plataforma retém 2% de
          taxa de serviço sobre cada transação.
        </p>
      </div>
    </SettingsSection>
  );
}
