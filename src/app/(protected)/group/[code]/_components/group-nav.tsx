"use client";

import { Button } from "@/components/ui/button";
import {
  Gamepad2Icon,
  LucideIcon,
  PieChartIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

const NavLink = ({
  href,
  title,
  icon: Icon,
}: {
  href: string;
  title: string;
  icon: LucideIcon;
}) => {
  const segment = useSelectedLayoutSegment();
  const segments = href.split("/");
  const lastSegment = segments[segments.length - 1];

  return (
    <li className="flex w-full">
      <Button
        data-active={segment === lastSegment}
        variant="ghost"
        asChild
        className="flex h-fit w-full flex-1 rounded-lg"
      >
        <Link
          href={href}
          className="flex w-full flex-1 flex-col items-center justify-center text-xs sm:flex-row"
        >
          <Icon className="size-4" />
          <span className="max-[28rem]:text-xs">{title}</span>
        </Link>
      </Button>
    </li>
  );
};

export const GroupNav = ({ code }: { code: string }) => {
  const buildHref = (path: string) => `/group/${code}${path}`;
  return (
    <nav className="sticky bottom-0 mt-auto flex h-fit items-center justify-center lg:bottom-0">
      <ul className="bg-background/50 **:data-[active=true]:text-primary **:data-[active=true]:bg-primary/10 flex w-full max-w-[calc(100vw-2rem)] justify-center gap-0.5 overflow-x-auto rounded-2xl border border-t border-b p-1 backdrop-blur-md **:data-[active=true]:pointer-events-none sm:max-w-[calc(100vw-8rem)] sm:justify-around md:w-fit md:p-2">
        <NavLink
          href={buildHref("/dashboard")}
          title="Dashboard"
          icon={PieChartIcon}
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
        {/* <NavLink
          href={buildHref("/history")}
          title="Histórico"
          icon={HistoryIcon}
        /> */}
      </ul>
    </nav>
  );
};
