import { Toaster } from "@/components/ui/sonner";
import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <Toaster richColors position="top-center" />
      {children}
    </div>
  );
}
