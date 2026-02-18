"use client";

// hooks/use-push-notifications.ts
import { savePushSubscription } from "@/actions/subscription/add";
import { removePushSubscription } from "@/actions/subscription/remove";
import { useCallback, useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// iOS 16.4+ instalado como PWA suporta push notifications
function iOSSupportsPush() {
  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (!isIOS) return true; // Não é iOS, suporte normal

  // iOS só suporta push se estiver instalado como PWA (standalone)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as Navigator & { standalone: boolean }).standalone);

  return isStandalone;
}

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    // No iOS, só funciona se estiver instalado como PWA
    if (!iOSSupportsPush()) return;

    setIsSupported(true);
    setPermission(Notification.permission);

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported) return;
    setIsLoading(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        });
      }

      const key = sub.getKey("p256dh");
      const authKey = sub.getKey("auth");
      if (!key || !authKey) return;

      const subscriptionData = {
        endpoint: sub.endpoint,
        p256dh: Buffer.from(key).toString("base64"),
        auth: Buffer.from(authKey).toString("base64"),
      };

      console.log("[Push Client] Salvando subscription:", {
        endpoint: subscriptionData.endpoint.substring(0, 50) + "...",
        hasKeys: !!subscriptionData.p256dh && !!subscriptionData.auth,
      });

      await savePushSubscription(subscriptionData);

      setIsSubscribed(true);
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);
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
      console.error("Erro ao desativar notificações:", error);
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
