import { AppSidebar } from "@/app/(protected)/_components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import React from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Toaster richColors position="top-center" />
      <AppSidebar />
      <ReactQueryDevtools />
      <SidebarInset className="flex">{children}</SidebarInset>
    </SidebarProvider>
  );
}
