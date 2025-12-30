import { AppSidebar } from "@/app/(protected)/_components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import React from "react";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log({ session });

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex max-h-dvh w-full">
        <Toaster richColors position="top-center" />
        <AppSidebar />
        <SidebarInset className="max-h-dvh flex-1 overflow-hidden rounded-2xl">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
