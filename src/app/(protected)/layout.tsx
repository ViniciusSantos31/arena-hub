import { AppSidebar } from "@/app/(protected)/_components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import React from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex max-h-svh w-full">
        <AppSidebar />
        <SidebarInset className="max-h-svh flex-1 overflow-hidden rounded-2xl">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
