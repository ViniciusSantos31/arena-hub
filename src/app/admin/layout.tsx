import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import { AdminSearchCommand } from "@/app/admin/_components/admin-search-command";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import React from "react";

import { assertAdmin } from "@/lib/admin/assert-admin";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await assertAdmin();
  } catch {
    redirect("/");
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("admin_sidebar_state")?.value;
  const defaultOpen = sidebarState ? sidebarState === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Toaster richColors position="top-center" />
      <AdminSidebar />
      <ReactQueryDevtools />
      <SidebarInset className="flex flex-col">
        <div className="border-b px-4 py-3 md:px-6">
          <AdminSearchCommand />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
