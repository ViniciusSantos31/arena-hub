"use client";

import { savePushSubscription } from "@/actions/subscription/add";
import { authClient } from "@/lib/auth-client";
import { useEffect, useRef } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationRegister() {
  const { data: session } = authClient.useSession();
  const registered = useRef(false);

  useEffect(() => {
    // Só executa se o usuário estiver logado
    if (!session?.user) return;

    // Evita registrar mais de uma vez na mesma sessão
    if (registered.current) return;

    // Verifica suporte do navegador
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Só registra se estiver rodando como PWA instalado
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches;
    if (!isInstalled) return;

    async function registerPush() {
      try {
        // Se já tem permissão concedida, apenas garante que a subscription está salva
        // Se está como 'default', pede permissão
        // Se está como 'denied', não faz nada
        if (Notification.permission === "denied") return;

        const permission =
          Notification.permission === "granted"
            ? "granted"
            : await Notification.requestPermission();

        if (permission !== "granted") return;

        const registration = await navigator.serviceWorker.ready;

        // Verifica se já existe uma subscription ativa
        let subscription = await registration.pushManager.getSubscription();

        // Se não existe, cria uma nova
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            ),
          });
        }

        const p256dh = subscription.getKey("p256dh");
        const auth = subscription.getKey("auth");

        if (!p256dh || !auth) return;

        // Salva ou atualiza no banco
        await savePushSubscription({
          endpoint: subscription.endpoint,
          p256dh: Buffer.from(p256dh).toString("base64"),
          auth: Buffer.from(auth).toString("base64"),
        });

        registered.current = true;
      } catch (error) {
        console.error(
          "[PushNotification] Erro ao registrar subscription:",
          error,
        );
      }
    }

    registerPush();
  }, [session?.user]);

  // Componente invisível — só executa a lógica
  return null;
}
