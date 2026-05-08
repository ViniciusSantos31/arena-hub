"use client";

import { Button } from "@/components/ui/button";
import { useGuard } from "@/hooks/use-guard";
import {
  ChartLineIcon,
  Gamepad2Icon,
  LucideIcon,
  SettingsIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

const NavLink = ({
  href,
  title,
  icon: Icon,
  isNew,
}: {
  href: string;
  title: string;
  icon: LucideIcon;
  isNew?: boolean;
}) => {
  const segment = useSelectedLayoutSegment();
  const segments = href.split("/");
  const lastSegment = segments[segments.length - 1];
  const isActive = segment === lastSegment;

  return (
    <li className="flex w-full">
      <Button
        data-active={isActive}
        variant="ghost"
        asChild
        className="focus-visible:ring-ring/60 flex h-fit w-full flex-1 rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className="relative flex w-full flex-1 flex-col items-center justify-center gap-1 px-2 py-2 text-xs sm:flex-row sm:gap-2"
        >
          {isNew && (
            <span className="text-primary absolute -top-1 right-0 text-pretty">
              Novo
            </span>
          )}
          <Icon className="size-4" />
          <span className="max-[28rem]:text-xs">{title}</span>
        </Link>
      </Button>
    </li>
  );
};

export const GroupNav = ({ code }: { code: string }) => {
  const buildHref = (path: string) => `/group/${code}${path}`;

  const canAccessSettings = useGuard({
    action: ["group:settings"],
  });

  return (
    <nav
      aria-label="Navegação do grupo"
      className="sticky bottom-0 z-30 mt-auto flex h-fit items-center justify-center lg:bottom-0"
    >
      <ul className="bg-background/50 **:data-[active=true]:text-primary **:data-[active=true]:bg-primary/10 flex w-full max-w-[calc(100vw-2rem)] justify-center gap-0.5 overflow-x-auto rounded-2xl border border-t border-b p-1 backdrop-blur-md **:data-[active=true]:pointer-events-none sm:max-w-[calc(100vw-8rem)] sm:justify-around md:w-fit md:p-2">
        <NavLink
          href={buildHref("/overview")}
          title="Visão geral"
          icon={ChartLineIcon}
        />
        <NavLink
          href={buildHref("/members")}
          title="Membros"
          icon={Users2Icon}
        />
        <NavLink
          href={buildHref("/matches")}
          title="Partidas"
          icon={Gamepad2Icon}
        />
        {canAccessSettings && (
          <NavLink
            href={buildHref("/settings")}
            title="Ajustes"
            icon={SettingsIcon}
          />
        )}
        {/* <NavLink
          href={buildHref("/history")}
          title="Histórico"
          icon={HistoryIcon}
        /> */}
      </ul>
    </nav>
  );
};
