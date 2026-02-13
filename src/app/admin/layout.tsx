import { AdminSidebar } from "@/app/admin/_components/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { cookies } from "next/headers";
import React from "react";

import { auth } from "@/lib/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar se o usuário é admin
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
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
      <SidebarInset className="flex">{children}</SidebarInset>
    </SidebarProvider>
  );
}
