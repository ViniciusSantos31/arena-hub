"use client";

// components/push-notification-register.tsx
import { usePushNotifications } from "@/hooks/use-push-notification";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef } from "react";

export function PushNotificationRegister() {
  const { data: session } = authClient.useSession();
  const { isSupported, permission, isSubscribed, subscribe } =
    usePushNotifications();
  const registered = useRef(false);

  useEffect(() => {
    // Só executa se o usuário estiver logado
    if (!session?.user) return;

    // Evita registrar mais de uma vez na mesma sessão
    if (registered.current) return;

    // Navegador/dispositivo não suporta push
    if (!isSupported) return;

    // Já está inscrito, não precisa fazer nada
    if (isSubscribed) return;

    // Usuário já negou, não pergunta de novo
    if (permission === "denied") return;

    registered.current = true;
    subscribe();
  }, [session?.user, isSupported, isSubscribed, permission, subscribe]);

  return null;
}
