"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPad no iOS 13+ se identifica como MacOS
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone: boolean }).standalone)
  );
}

export function InstallPWABanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado como PWA
    if (isInStandaloneMode()) {
      return;
    }

    // Verifica se o usuário já dispensou o banner antes
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const ios = isIOS();
    setIsIos(ios);

    if (ios) {
      // No iOS não tem evento, mostra o banner com instruções diretamente
      setIsVisible(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
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

  if (!isVisible) return null;

  if (isIos) {
    return (
      <div className="bg-primary text-primary-foreground relative w-full px-4 py-3 shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Share className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm leading-snug font-medium">
              Instale o Arena Hub: toque em{" "}
              <Share className="mx-0.5 -mt-0.5 inline h-3.5 w-3.5" /> e depois
              em <strong>&quot;Adicionar à Tela de Início&quot;</strong>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 p-1 transition-opacity hover:opacity-80"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

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
