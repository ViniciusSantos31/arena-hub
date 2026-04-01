"use client";

import { cancelSubscription } from "@/actions/membership/cancel-subscription";
import { getSubscription } from "@/actions/membership/get-subscription";
import { subscribeMembership } from "@/actions/membership/subscribe";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/payments";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

const WEBHOOK_POLL_INTERVAL_MS = 2000;
const WEBHOOK_POLL_TIMEOUT_MS = 30000;

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  organizationCode: string;
  amountCents: number;
  onSubscribed: () => void;
}

// ── Formulário de confirmação de assinatura ───────────────────────────────

interface SubscriptionFormProps {
  organizationCode: string;
  amountCents: number;
  onSuccess: () => void;
  onClose: () => void;
}

function SubscriptionForm({
  organizationCode,
  amountCents,
  onSuccess,
  onClose,
}: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingWebhook, setIsWaitingWebhook] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionCreated, setSubscriptionCreated] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref para evitar submissões simultâneas (proteção extra além do isProcessing)
  const isSubmittingRef = useRef(false);
  const queryClient = useQueryClient();

  const stopPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
  };

  const waitForWebhookConfirmation = () => {
    setIsWaitingWebhook(true);

    pollIntervalRef.current = setInterval(async () => {
      const result = await getSubscription({ organizationCode });
      if (result?.data?.status === "active") {
        stopPolling();
        setIsWaitingWebhook(false);
        queryClient.invalidateQueries({
          queryKey: ["subscription", organizationCode],
        });
        toast.success(
          "Assinatura confirmada! Você agora tem acesso ilimitado às partidas.",
        );
        onSuccess();
      }
    }, WEBHOOK_POLL_INTERVAL_MS);

    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setIsWaitingWebhook(false);
      queryClient.invalidateQueries({
        queryKey: ["subscription", organizationCode],
      });
      toast.success("Assinatura criada! Aguarde a confirmação do banco.");
      onSuccess();
    }, WEBHOOK_POLL_TIMEOUT_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Proteção dupla contra cliques simultâneos: ref (síncrona) + state (UI)
    if (!stripe || !elements || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsProcessing(true);

    // Passo 1: cria ou recupera assinatura no backend
    let secret = clientSecret;
    if (!subscriptionCreated) {
      const result = await subscribeMembership({ organizationCode });

      if (!result?.data) {
        toast.error(
          result?.serverError ?? "Não foi possível iniciar a assinatura.",
        );
        setIsProcessing(false);
        isSubmittingRef.current = false;
        return;
      }

      // Marca como criada imediatamente para evitar dupla criação
      setSubscriptionCreated(true);

      secret = result.data.clientSecret ?? null;
      if (secret) setClientSecret(secret);

      // Se não há clientSecret, a assinatura já foi confirmada automaticamente
      // (pode ocorrer em test mode ou quando o pagamento auto-aprova)
      if (!secret) {
        setIsProcessing(false);
        isSubmittingRef.current = false;
        waitForWebhookConfirmation();
        return;
      }
    }

    if (!secret) {
      // Assinatura criada em sessão anterior mas clientSecret não disponível
      setIsProcessing(false);
      isSubmittingRef.current = false;
      waitForWebhookConfirmation();
      return;
    }

    // Passo 2: valida campos do cartão
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setIsProcessing(false);
      isSubmittingRef.current = false;
      return;
    }

    // Passo 3: confirma o pagamento com o clientSecret da 1ª fatura
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret: secret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    setIsProcessing(false);
    isSubmittingRef.current = false;

    if (error) {
      toast.error(error.message ?? "Pagamento recusado. Tente outro cartão.");
      return;
    }

    // Aguarda webhook confirmar no DB
    waitForWebhookConfirmation();
  };

  if (isWaitingWebhook) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
        <div className="text-center">
          <p className="font-medium">Confirmando assinatura...</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Aguardando confirmação do banco.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Mensalidade</span>
          <span className="text-lg font-semibold">
            {formatBRL(amountCents)} / mês
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          Renovação automática mensal. Você poderá cancelar a qualquer momento.
        </p>
      </div>

      <PaymentElement options={{ layout: "auto" }} />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={isProcessing}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={!stripe || !elements || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <LockIcon className="size-4" />
              {`Assinar ${formatBRL(amountCents)}/mês`}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────

export function SubscriptionModal({
  open,
  onClose,
  organizationCode,
  amountCents,
  onSubscribed,
}: SubscriptionModalProps) {
  const { theme = "dark" } = useTheme();
  const isDark = useMemo(() => theme !== "light", [theme]);

  const appearance = useMemo(
    () => ({
      theme: isDark ? "night" : "flat",
      variables: { borderRadius: "8px" },
    }),
    [isDark],
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assinar plano mensal</DialogTitle>
          <DialogDescription>
            Com a assinatura ativa, você fica isento de pagar por cada partida.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: "subscription",
              amount: amountCents,
              currency: "brl",
              locale: "pt-BR",
              appearance: {
                ...appearance,
                rules: {
                  ".TermsText": {
                    fontSize: "12px",
                  },
                },
              } as StripeElementsOptions["appearance"],
            }}
          >
            <SubscriptionForm
              organizationCode={organizationCode}
              amountCents={amountCents}
              onSuccess={onSubscribed}
              onClose={onClose}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Botão de cancelar assinatura ──────────────────────────────────────────

interface CancelSubscriptionButtonProps {
  organizationCode: string;
  onCancelled: () => void;
}

export function CancelSubscriptionButton({
  organizationCode,
  onCancelled,
}: CancelSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Tem certeza que deseja cancelar sua assinatura? Você ainda terá acesso até o final do período vigente.",
    );
    if (!confirmed) return;

    setIsLoading(true);
    try {
      const result = await cancelSubscription({ organizationCode });
      if (result?.data?.cancelled) {
        toast.success(
          "Assinatura cancelada. Seu acesso permanece até o fim do período atual.",
        );
        onCancelled();
      } else {
        toast.error(
          result?.serverError ?? "Não foi possível cancelar a assinatura.",
        );
      }
    } catch {
      toast.error("Erro ao cancelar assinatura.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCancel}
      disabled={isLoading}
      className="text-destructive hover:text-destructive"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : null}
      Cancelar assinatura
    </Button>
  );
}
