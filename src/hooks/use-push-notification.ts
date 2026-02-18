"use client";

// hooks/use-push-notifications.ts
import { savePushSubscription } from "@/actions/subscription/add";
import { removePushSubscription } from "@/actions/subscription/remove";
import { useCallback, useEffect, useState } from "react";

// iOS 16.4+ instalado como PWA suporta push notifications
function iOSSupportsPush() {
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (!isIOS) return true;

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone: boolean }).standalone);

  return isStandalone;
}

// Gera um token FCM único para este dispositivo
async function getOrCreateFCMToken(): Promise<string | null> {
  try {
    const registration = await navigator.serviceWorker.ready;

    // Obtém a subscription do Push API
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // Cria uma nova subscription usando a VAPID key do Firebase
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        ),
      });
    }

    // O "token" FCM nesse caso é o endpoint completo
    // Firebase usa isso como identificador único
    return subscription.endpoint;
  } catch (error) {
    console.error("[Push] Erro ao obter token FCM:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    if (!iOSSupportsPush()) return;

    setIsSupported(true);
    setPermission(Notification.permission);

    // Verifica se já tem subscription
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    console.log("[Push] subscribe() chamado");
    if (!isSupported) {
      console.log("[Push] Não suportado neste dispositivo");
      return;
    }
    setIsLoading(true);

    try {
      console.log("[Push] Pedindo permissão...");
      const result = await Notification.requestPermission();
      console.log("[Push] Permissão recebida:", result);
      setPermission(result);

      if (result !== "granted") {
        console.log("[Push] Permissão negada");
        return;
      }

      console.log("[Push] Obtendo token FCM...");
      const token = await getOrCreateFCMToken();

      if (!token) {
        console.error("[Push] Falha ao obter token");
        return;
      }

      console.log("[Push] Token obtido:", token.substring(0, 50) + "...");
      console.log("[Push] Salvando no banco...");

      await savePushSubscription(token);

      console.log("[Push] Token salvo com sucesso!");
      setIsSubscribed(true);
    } catch (error) {
      console.error("[Push] Erro completo:", error);
      console.error("[Push] Stack:", (error as Error).stack);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (!sub) return;

      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
      setIsSubscribed(false);
    } catch (error) {
      console.error("[Push] Erro ao desativar:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported,
    subscribe,
    unsubscribe,
  };
}
