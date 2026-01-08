"use client";

import { Button } from "@/components/ui/button";
import {
  Gamepad2Icon,
  LucideIcon,
  MedalIcon,
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

  return (
    <li className="flex w-full">
      <Button
        data-active={segment === href}
        variant="ghost"
        asChild
        className="flex h-fit w-full flex-1"
      >
        <Link
          href={href}
          className="flex w-full flex-1 flex-col items-center justify-center text-xs sm:flex-row"
        >
          <Icon className="size-4" />
          <span className="max-[22rem]:text-[8px]">{title}</span>
        </Link>
      </Button>
    </li>
  );
};

export const GroupNav = () => {
  return (
    <nav className="flex h-fit w-full items-center justify-center lg:sticky lg:bottom-4">
      <ul className="bg-background **:data-[active=true]:text-primary **:data-[active=true]:bg-primary/10 flex w-full gap-0.5 overflow-x-auto border-t border-b-0 p-2 py-3 **:data-[active=true]:pointer-events-none sm:justify-around lg:w-fit lg:justify-center lg:rounded-2xl lg:border lg:border-b lg:py-2">
        <NavLink href="dashboard" title="Dashboard" icon={PieChartIcon} />
        <NavLink href="members" title="Membros" icon={Users2Icon} />
        <NavLink href="matches" title="Partidas" icon={Gamepad2Icon} />
        <NavLink href="rankings" title="Classificações" icon={MedalIcon} />
      </ul>
    </nav>
  );
};
