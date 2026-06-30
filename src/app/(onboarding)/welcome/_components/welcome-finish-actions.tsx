import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CompassIcon, HomeIcon, PlusIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface FinishAction {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accent: "primary" | "teal" | "muted";
  primary?: boolean;
}

const FINISH_ACTIONS: FinishAction[] = [
  {
    title: "Criar grupo",
    description: "Monte seu grupo e convide a galera para jogar",
    href: "/group/create",
    icon: PlusIcon,
    accent: "primary",
    primary: true,
  },
  {
    title: "Explorar grupos",
    description: "Encontre grupos públicos ou solicite entrada em privados",
    href: "/groups",
    icon: CompassIcon,
    accent: "teal",
  },
  {
    title: "Ir para o início",
    description: "Acesse sua home e explore a plataforma",
    href: "/home",
    icon: HomeIcon,
    accent: "muted",
  },
];

const accentClasses: Record<FinishAction["accent"], string> = {
  primary:
    "bg-primary/10 text-primary ring-primary/15 group-hover:bg-primary/15",
  teal: "bg-teal-500/10 text-teal-600 dark:text-teal-400 ring-teal-500/15 group-hover:bg-teal-500/15",
  muted:
    "bg-muted text-muted-foreground ring-border/60 group-hover:bg-muted/80",
};

const borderClasses: Record<FinishAction["accent"], string> = {
  primary: "hover:border-primary/40",
  teal: "hover:border-teal-500/40",
  muted: "hover:border-border",
};

export function WelcomeFinishActions() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-3">
      {FINISH_ACTIONS.map((action) => {
        const Icon = action.icon;

        if (action.primary) {
          return (
            <Button
              key={action.href}
              asChild
              size="lg"
              className={cn(
                "border-primary/60 h-auto w-full justify-start gap-4 border px-5 py-4",
                "bg-primary/10 text-primary ring-primary/15 group-hover:bg-primary/15 hover:bg-primary/15",
              )}
            >
              <Link href={action.href}>
                <div className="bg-primary-foreground/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 text-left">
                  <p className="font-semibold">{action.title}</p>
                  <p className="text-muted-foreground text-xs font-normal">
                    {action.description}
                  </p>
                </div>
              </Link>
            </Button>
          );
        }

        return (
          <Link
            key={action.href}
            href={action.href}
            className="group outline-none"
          >
            <div
              className={cn(
                "bg-card border-border/60 flex items-center gap-4 rounded-xl border p-4 transition-colors",
                borderClasses[action.accent],
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors",
                  accentClasses[action.accent],
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-semibold">{action.title}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
