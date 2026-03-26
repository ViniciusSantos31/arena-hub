"use client";

import { getUserMatchPlayer } from "@/actions/match/join";
import { cancelCharge } from "@/actions/payment/cancel-charge";
import { createCharge } from "@/actions/payment/create-charge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBRL } from "@/lib/payments";
import { queryClient } from "@/lib/react-query";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { matchDetailQueryKeys } from "../_hooks";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

const WEBHOOK_POLL_INTERVAL_MS = 2000;
const WEBHOOK_POLL_TIMEOUT_MS = 30000;

interface PaymentCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  matchId: string;
  organizationCode: string;
  pricePerPlayerCents: number;
}

interface CheckoutFormProps {
  matchId: string;
  organizationCode: string;
  pricePerPlayerCents: number;
  onSuccess: () => void;
  onClose: () => void;
}

function CheckoutForm({
  matchId,
  organizationCode,
  pricePerPlayerCents,
  onSuccess,
  onClose,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaitingWebhook, setIsWaitingWebhook] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
  };

  useEffect(() => () => stopPolling(), []);

  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      predicate(query) {
        return (
          query.queryKey[0] === matchDetailQueryKeys.all[0] ||
          query.queryKey[0] === "player"
        );
      },
    });
  };

  // Aguarda o webhook atualizar o DB via polling
  const waitForWebhookConfirmation = () => {
    setIsWaitingWebhook(true);

    pollIntervalRef.current = setInterval(async () => {
      const result = await getUserMatchPlayer({ matchId });
      if (result?.data?.paymentStatus === "paid") {
        stopPolling();
        setIsWaitingWebhook(false);
        invalidateQueries();
        toast.success("Pagamento confirmado! Sua vaga está garantida.");
        onSuccess();
      }
    }, WEBHOOK_POLL_INTERVAL_MS);

    // Fallback: encerra após 30s mesmo sem confirmação do webhook
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setIsWaitingWebhook(false);
      invalidateQueries();
      toast.success("Pagamento autorizado! Sua vaga será confirmada em breve.");
      onSuccess();
    }, WEBHOOK_POLL_TIMEOUT_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    // 1. Valida os dados do cartão no Stripe antes de criar o PI
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // toast.error(submitError.message ?? "Dados do cartão inválidos.");
      setIsProcessing(false);
      return;
    }

    // 2. Cria o PaymentIntent apenas na hora do submit — cancelar o modal
    //    antes desse ponto não cria nenhum estado inconsistente no banco
    const chargeResult = await createCharge({
      matchId,
      organizationCode,
      method: "credit_card",
    });

    const clientSecret = chargeResult?.data?.clientSecret;

    if (!clientSecret) {
      const msg =
        chargeResult?.serverError ?? "Não foi possível iniciar o pagamento.";
      toast.error(msg);
      setIsProcessing(false);
      return;
    }

    // 3. Confirma o pagamento com o clientSecret recém-criado
    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (error) {
      // Cartão recusado — cancela o PI e limpa o banco automaticamente
      await cancelCharge({ matchId });
      toast.error(error.message ?? "Pagamento recusado. Tente outro cartão.");
      return;
    }

    // Pagamento autorizado — aguarda o webhook confirmar no DB
    waitForWebhookConfirmation();
  };

  if (isWaitingWebhook) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <div className="border-primary h-10 w-10 animate-spin rounded-full border-2 border-t-transparent" />
        <div className="text-center">
          <p className="font-medium">Confirmando pagamento...</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Aguardando confirmação do banco. Isso pode levar alguns segundos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Valor da inscrição
          </span>
          <span className="text-lg font-semibold">
            {formatBRL(pricePerPlayerCents)}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          O valor será reservado agora e liberado ao organizador após a partida.
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
              <LockIcon className="h-4 w-4" />
              {`Pagar ${formatBRL(pricePerPlayerCents)}`}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function PaymentCheckoutModal({
  open,
  onClose,
  matchId,
  organizationCode,
  pricePerPlayerCents,
}: PaymentCheckoutModalProps) {
  const { theme = "dark" } = useTheme();

  const isDark = useMemo(() => theme !== "light", [theme]);
  const appearance = useMemo(
    () => ({
      theme: isDark ? "night" : "flat",
      variables: {
        borderRadius: "8px",
      },
    }),
    [isDark],
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar inscrição</DialogTitle>
          <DialogDescription>
            Insira os dados do cartão para garantir sua vaga na partida.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: pricePerPlayerCents,
              currency: "brl",
              locale: "pt-BR",
              capture_method: "manual",
              appearance: appearance as StripeElementsOptions["appearance"],
            }}
          >
            <CheckoutForm
              matchId={matchId}
              organizationCode={organizationCode}
              pricePerPlayerCents={pricePerPlayerCents}
              onSuccess={onClose}
              onClose={onClose}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
