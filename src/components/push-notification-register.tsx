"use client";

// components/push-notification-register.tsx
import { usePushNotifications } from "@/hooks/use-push-notification";
import { authClient } from "@/lib/auth-client";
import { Bell, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function isIOS() {
  if (typeof window === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function PushNotificationRegister() {
  const { data: session } = authClient.useSession();
  const { isSupported, permission, isSubscribed, subscribe } =
    usePushNotifications();
  const registered = useRef(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    if (registered.current) return;
    if (!isSupported) return;
    if (isSubscribed) return;
    if (permission === "denied") return;

    // Verifica se o usuário já dispensou o prompt de notificação antes
    const dismissed = localStorage.getItem("push-prompt-dismissed");
    if (dismissed) return;

    if (isIOS()) {
      // No iOS não podemos chamar automaticamente — mostra prompt manual
      setShowIOSPrompt(true);
      return;
    }

    // Android/Desktop — pode chamar diretamente
    registered.current = true;
    subscribe();
  }, [session?.user, isSupported, isSubscribed, permission, subscribe]);

  const handleIOSAccept = async () => {
    setShowIOSPrompt(false);
    registered.current = true;
    await subscribe();
  };

  const handleIOSDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem("push-prompt-dismissed", "true");
  };

  if (!showIOSPrompt) return null;

  return (
    <div className="bg-card fixed right-4 bottom-4 left-4 z-50 rounded-xl border p-4 shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-full p-2">
            <Bell className="text-primary h-5 w-5" />
          </div>
          <p className="text-sm font-semibold">Ativar notificações</p>
        </div>
        <button
          onClick={handleIOSDismiss}
          className="text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-muted-foreground mb-4 text-sm">
        Receba alertas de novas partidas, sorteios de times e solicitações do
        grupo.
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleIOSAccept}
          className="bg-primary text-primary-foreground flex-1 rounded-lg py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Ativar
        </button>
        <button
          onClick={handleIOSDismiss}
          className="hover:bg-accent flex-1 rounded-lg border py-2 text-sm font-medium transition-colors"
        >
          Agora não
        </button>
      </div>
    </div>
  );
}
