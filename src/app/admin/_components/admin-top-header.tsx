"use client";

import { AdminSearchCommand } from "@/app/admin/_components/admin-search-command";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminTopHeader() {
  return (
    <header className="border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 shrink-0 border-b px-4 py-2.5 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:gap-3">
        <SidebarTrigger />
        <AdminSearchCommand className="min-w-0 flex-1" />
        <ModeToggle />
      </div>
    </header>
  );
}
