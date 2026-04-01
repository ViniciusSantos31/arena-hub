"use client";

import { getUserMatchPlayer } from "@/actions/match/join";
import { cancelCharge } from "@/actions/payment/cancel-charge";
import { createCharge } from "@/actions/payment/create-charge";
import { deleteSavedPaymentMethod } from "@/actions/payment/delete-saved-payment-method";
import { getSavedPaymentMethods } from "@/actions/payment/get-saved-payment-methods";
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
import { useQuery } from "@tanstack/react-query";
import {
  CreditCardIcon,
  Loader2Icon,
  LockIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
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

// ── Cartão salvo ─────────────────────────────────────────────────────────

function CardBrandIcon({ brand }: { brand: string }) {
  return <CreditCardIcon className="text-muted-foreground size-4" />;
}

interface SavedCardRowProps {
  method: {
    id: string;
    stripePaymentMethodId: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    isDefault: boolean;
  };
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function SavedCardRow({
  method,
  selected,
  onSelect,
  onDelete,
  isDeleting,
}: SavedCardRowProps) {
  return (
    <div
      role="button"
      onClick={onSelect}
      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/50"
      }`}
    >
      <CardBrandIcon brand={method.brand} />
      <div className="flex-1 text-sm">
        <span className="font-medium capitalize">{method.brand}</span>{" "}
        <span className="text-muted-foreground">•••• {method.last4}</span>
        <span className="text-muted-foreground ml-2">
          {String(method.expMonth).padStart(2, "0")}/{method.expYear}
        </span>
      </div>
      {method.isDefault && (
        <span className="text-muted-foreground text-xs">Padrão</span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        disabled={isDeleting}
        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        aria-label="Remover cartão"
      >
        {isDeleting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <Trash2Icon className="size-4" />
        )}
      </button>
    </div>
  );
}

// ── Formulário de checkout ────────────────────────────────────────────────

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: savedMethods = [], refetch: refetchSaved } = useQuery({
    queryKey: ["saved-payment-methods"],
    queryFn: async () =>
      getSavedPaymentMethods().then((res) => res?.data ?? []),
  });

  // Pré-seleciona o cartão padrão (ou o primeiro) ao carregar
  useEffect(() => {
    if (savedMethods.length > 0 && selectedSavedId === null && !showNewCard) {
      const defaultMethod =
        savedMethods.find((m) => m.isDefault) ?? savedMethods[0];
      setSelectedSavedId(defaultMethod.stripePaymentMethodId);
    }
    if (savedMethods.length === 0) {
      setShowNewCard(true);
    }
  }, [savedMethods, selectedSavedId, showNewCard]);

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

    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setIsWaitingWebhook(false);
      invalidateQueries();
      toast.success("Pagamento autorizado! Sua vaga será confirmada em breve.");
      onSuccess();
    }, WEBHOOK_POLL_TIMEOUT_MS);
  };

  const handleDeleteCard = async (stripePaymentMethodId: string) => {
    setDeletingId(stripePaymentMethodId);
    try {
      await deleteSavedPaymentMethod({
        paymentMethodId: stripePaymentMethodId,
      });
      await refetchSaved();
      if (selectedSavedId === stripePaymentMethodId) {
        setSelectedSavedId(null);
      }
      toast.success("Cartão removido.");
    } catch {
      toast.error("Não foi possível remover o cartão.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe) return;
    setIsProcessing(true);

    // ── Pagamento com cartão salvo ────────────────────────────────────────
    if (selectedSavedId && !showNewCard) {
      const chargeResult = await createCharge({
        matchId,
        organizationCode,
        method: "credit_card",
        savedPaymentMethodId: selectedSavedId,
      });

      if (!chargeResult?.data) {
        toast.error(
          chargeResult?.serverError ?? "Não foi possível iniciar o pagamento.",
        );
        setIsProcessing(false);
        return;
      }

      if (chargeResult.data.alreadyConfirmed) {
        // Pagamento já foi confirmado com o método salvo, aguarda webhook
        setIsProcessing(false);
        waitForWebhookConfirmation();
        return;
      }

      // Se por algum motivo precisar de ação adicional
      const { clientSecret } = chargeResult.data;
      if (clientSecret) {
        const { error } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: selectedSavedId,
        });
        setIsProcessing(false);
        if (error) {
          await cancelCharge({ matchId });
          toast.error(
            error.message ?? "Pagamento recusado. Tente outro cartão.",
          );
          return;
        }
        waitForWebhookConfirmation();
      }
      return;
    }

    // ── Pagamento com novo cartão ─────────────────────────────────────────
    if (!elements) {
      setIsProcessing(false);
      return;
    }

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setIsProcessing(false);
      return;
    }

    const chargeResult = await createCharge({
      matchId,
      organizationCode,
      method: "credit_card",
    });

    const clientSecret = chargeResult?.data?.clientSecret;

    if (!clientSecret) {
      toast.error(
        chargeResult?.serverError ?? "Não foi possível iniciar o pagamento.",
      );
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    setIsProcessing(false);

    if (error) {
      await cancelCharge({ matchId });
      toast.error(error.message ?? "Pagamento recusado. Tente outro cartão.");
      return;
    }

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

  const canPay =
    selectedSavedId && !showNewCard ? true : !!stripe && !!elements;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Valor */}
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

      {/* Cartões salvos */}
      {savedMethods.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Cartões salvos</p>
          {savedMethods.map((m) => (
            <SavedCardRow
              key={m.id}
              method={m}
              selected={
                selectedSavedId === m.stripePaymentMethodId && !showNewCard
              }
              onSelect={() => {
                setSelectedSavedId(m.stripePaymentMethodId);
                setShowNewCard(false);
              }}
              onDelete={() => handleDeleteCard(m.stripePaymentMethodId)}
              isDeleting={deletingId === m.stripePaymentMethodId}
            />
          ))}

          <button
            type="button"
            onClick={() => {
              setShowNewCard(true);
              setSelectedSavedId(null);
            }}
            className={`flex w-full items-center gap-2 rounded-lg border border-dashed p-3 text-sm transition-colors ${
              showNewCard
                ? "border-primary text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            <PlusIcon className="size-4" />
            Usar outro cartão
          </button>
        </div>
      )}

      {/* Stripe Elements — novo cartão */}
      {showNewCard && (
        <div className="space-y-2">
          {savedMethods.length > 0 && (
            <p className="text-sm font-medium">Novo cartão</p>
          )}
          <PaymentElement options={{ layout: "auto" }} />
          <p className="text-muted-foreground text-xs">
            O cartão será salvo para facilitar pagamentos futuros.
          </p>
        </div>
      )}

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
          disabled={!canPay || isProcessing}
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

// ── Modal ─────────────────────────────────────────────────────────────────

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
              setup_future_usage: "off_session",
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
