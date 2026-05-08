import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

const mediaFrame =
  "bg-background ring-border/50 shadow-lg ring-1 dark:shadow-primary/15 dark:shadow-xl";

export function InviteCenteredShell({
  icon: Icon,
  groupLogo,
  iconClassName,
  title,
  description,
  children,
  footer,
}: {
  icon: LucideIcon;
  groupLogo: string | null;
  iconClassName?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="landing-wash absolute inset-0 opacity-70" />
        <div className="landing-dots absolute inset-0 opacity-50" />
        <div className="from-background via-background/70 to-background absolute inset-0 bg-linear-to-b" />
      </div>

      <div className="relative z-0 flex flex-col gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="mx-auto flex items-center justify-center -space-x-3">
            <div
              className={cn(
                "z-10 flex size-14 items-center justify-center rounded-2xl",
                "bg-muted/80 backdrop-blur-sm",
                mediaFrame,
              )}
            >
              <Icon className={cn("h-7 w-7", iconClassName)} />
            </div>
            {groupLogo ? (
              <Image
                src={groupLogo}
                alt="Logo do grupo"
                width={100}
                height={100}
                className={cn(
                  "relative size-14 rounded-2xl object-cover p-0.5",
                  mediaFrame,
                )}
              />
            ) : null}
          </div>

          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight text-balance">
              {title}
            </h1>
            {description ? (
              <p className="text-muted-foreground mx-auto max-w-prose text-sm leading-relaxed text-pretty">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {children ? <div className="w-full text-left">{children}</div> : null}

        {footer ? (
          <div
            className={cn(
              "border-border/40 flex w-full flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-center",
              "*:data-[slot=button]:w-full *:data-[slot=button]:max-w-sm",
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </main>
  );
}
