"use client";

import { savePushSubscription } from "@/actions/subscription/add";
import { removePushSubscription } from "@/actions/subscription/remove";
import { useCallback, useEffect, useState } from "react";

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

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    setPermission(Notification.permission);

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub);
      });
    });
  }, []);

  const subscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    setIsLoading(true);

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const key = sub.getKey("p256dh");
      const authKey = sub.getKey("auth");

      await savePushSubscription({
        endpoint: sub.endpoint,
        p256dh: Buffer.from(key!).toString("base64"),
        auth: Buffer.from(authKey!).toString("base64"),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
