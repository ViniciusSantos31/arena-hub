import Link from "next/link";
import { AlertTriangleIcon, MessageSquareWarningIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminAlert = {
  type: string;
  count: number;
  href: string;
  label: string;
};

export function AdminAlerts({
  pendingFeedbacks,
  pastDue,
  alerts,
}: {
  pendingFeedbacks: number;
  pastDue: number;
  alerts?: AdminAlert[];
}) {
  const items =
    alerts ??
    [
      pendingFeedbacks > 0
        ? {
            type: "pending_feedbacks",
            count: pendingFeedbacks,
            href: "/admin/feedbacks",
            label: "Feedbacks pendentes de moderação",
          }
        : null,
      pastDue > 0
        ? {
            type: "past_due",
            count: pastDue,
            href: "/admin/billing",
            label: "Assinaturas com pagamento em atraso",
          }
        : null,
    ].filter(Boolean) as AdminAlert[];

  if (items.length === 0) return null;

  return (
    <section aria-label="Alertas que requerem atenção">
      <ul className="grid list-none gap-3 sm:grid-cols-2">
        {items.map((alert) => (
          <li key={alert.type}>
            <Link
              href={alert.href}
              className={cn(
                "block rounded-xl transition-colors",
                "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
            >
              <Card className="border-destructive/30 bg-destructive/5 transition-colors hover:bg-destructive/10">
                <CardContent className="flex items-center gap-3 p-4">
                  {alert.type === "pending_feedbacks" ? (
                    <MessageSquareWarningIcon
                      className="text-destructive h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertTriangleIcon
                      className="text-destructive h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{alert.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {alert.count}{" "}
                      {alert.count === 1
                        ? "item requer atenção"
                        : "itens requerem atenção"}
                    </p>
                  </div>
                  <span
                    className="text-destructive text-lg font-bold tabular-nums"
                    aria-hidden="true"
                  >
                    {alert.count}
                  </span>
                  <span className="sr-only">
                    {alert.count}{" "}
                    {alert.count === 1 ? "item pendente" : "itens pendentes"} —
                    clique para ver
                  </span>
                </CardContent>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
