"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWABanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado como PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Verifica se o usuário já dispensou o banner antes
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    console.log("Tentando instalar PWA...", prompt);
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  // if (!isVisible || isInstalled) return null;

  return (
    <div className="bg-primary animate-in text-primary-foreground relative flex w-full items-center justify-between gap-4 px-4 py-3 shadow-md">
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">
          Instale o Arena Hub para uma experiência melhor!
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={handleInstall}
          className="cursor-pointer text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 transition-opacity hover:opacity-80"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
