import { AppSidebar } from "@/app/(protected)/_components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import React from "react";

import { PushNotificationRegister } from "@/components/push-notification-register";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = sidebarState ? sidebarState === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Toaster richColors position="top-center" />
      <AppSidebar />
      <ReactQueryDevtools />
      <SidebarInset className="flex">{children}</SidebarInset>
      <PushNotificationRegister />
    </SidebarProvider>
  );
}
