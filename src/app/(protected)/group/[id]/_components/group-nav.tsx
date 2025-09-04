"use client";

import { Button } from "@/components/ui/button";
import {
  Gamepad2Icon,
  MedalIcon,
  PieChartIcon,
  Users2Icon,
} from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export const GroupNav = () => {
  const segment = useSelectedLayoutSegment();

  return (
    <nav className="flex w-full items-center justify-center @2xl:sticky @2xl:bottom-7">
      <ul className="bg-background **:data-[active=true]:text-primary **:data-[active=true]:bg-primary/10 flex w-full justify-start gap-0.5 overflow-x-auto border-t border-b-0 p-2 py-3 **:data-[active=true]:pointer-events-none sm:justify-around @2xl:w-fit @2xl:justify-center @2xl:rounded-2xl @2xl:border @2xl:border-b @2xl:py-2">
        <li>
          <Button data-active={segment === "dashboard"} variant="ghost" asChild>
            <Link href={"dashboard"}>
              <PieChartIcon />
              Dashboard
            </Link>
          </Button>
        </li>
        <li>
          <Button data-active={segment === "members"} variant="ghost" asChild>
            <Link href={"members"}>
              <Users2Icon />
              Membros
            </Link>
          </Button>
        </li>
        <li>
          <Button
            disabled
            data-active={segment === "matches"}
            variant="ghost"
            asChild
          >
            <Link href={"matches"}>
              <Gamepad2Icon />
              Partidas
            </Link>
          </Button>
        </li>
        <li>
          <Button
            disabled
            data-active={segment === "rankings"}
            variant="ghost"
            asChild
          >
            <Link href={"rankings"}>
              <MedalIcon />
              Classificações
            </Link>
          </Button>
        </li>
      </ul>
    </nav>
  );
};
