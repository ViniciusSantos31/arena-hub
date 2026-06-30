import { cn } from "@/lib/utils";
import type {
  SubscriptionPayment,
  SubscriptionPaymentStatus,
} from "@/lib/stripe-billing/list-subscription-invoices";
import { ExternalLinkIcon, ReceiptIcon } from "lucide-react";

const STATUS_LABELS: Record<SubscriptionPaymentStatus, string> = {
  paid: "Pago",
  open: "Pendente",
  void: "Cancelado",
  uncollectible: "Incobrável",
  draft: "Rascunho",
};

const statusBadgeClass: Record<SubscriptionPaymentStatus, string> = {
  paid: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400",
  open: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  void: "border-border bg-muted/60 text-muted-foreground",
  uncollectible: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  draft: "border-border bg-muted/60 text-muted-foreground",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amountCents: number, currency: string) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

type SubscriptionPaymentHistoryProps = {
  payments: SubscriptionPayment[];
};

export function SubscriptionPaymentHistory({
  payments,
}: SubscriptionPaymentHistoryProps) {
  if (payments.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Histórico de pagamentos
        </p>
        <p className="text-muted-foreground rounded-xl border border-dashed py-8 text-center text-sm">
          Nenhum pagamento registrado ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        Histórico de pagamentos
      </p>
      <div className="divide-y rounded-xl border">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center gap-3 px-4 py-3 first:rounded-t-xl last:rounded-b-xl"
          >
            <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
              <ReceiptIcon className="text-muted-foreground size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tabular-nums">
                {formatAmount(payment.amountCents, payment.currency)}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDate(payment.date)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  statusBadgeClass[payment.status],
                )}
              >
                {STATUS_LABELS[payment.status]}
              </span>
              {payment.invoiceUrl ? (
                <a
                  href={payment.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors"
                  aria-label="Ver fatura"
                >
                  <ExternalLinkIcon className="size-4" />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
