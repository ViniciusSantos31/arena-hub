"use client";

// hooks/use-push-notifications.ts
import { savePushSubscription } from "@/actions/subscription/add";
import { removePushSubscription } from "@/actions/subscription/remove";
import { getFirebaseMessaging } from "@/lib/firebase";
import { deleteToken, getToken } from "firebase/messaging";
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

export function usePushNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (!iOSSupportsPush()) return;

    setIsSupported(true);
    setPermission(Notification.permission);

    // Verifica se já tem token salvo
    const checkExistingToken = async () => {
      try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        }).catch(() => null);

        if (token) {
          setCurrentToken(token);
          setIsSubscribed(true);
        }
      } catch {
        console.log("[Push] Nenhum token existente");
      }
    };

    checkExistingToken();
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

      console.log("[Push] Inicializando Firebase Messaging...");
      const messaging = await getFirebaseMessaging();

      if (!messaging) {
        console.error("[Push] Firebase Messaging não disponível");
        return;
      }

      console.log("[Push] Obtendo token FCM...");
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });

      if (!token) {
        console.error("[Push] Falha ao obter token");
        return;
      }

      console.log("[Push] Token FCM obtido:", token.substring(0, 30) + "...");
      console.log("[Push] Salvando no banco...");

      await savePushSubscription(token);

      console.log("[Push] Token salvo com sucesso!");
      setCurrentToken(token);
      setIsSubscribed(true);
    } catch (error) {
      console.error("[Push] Erro completo:", error);
      console.error("[Push] Stack:", (error as Error).stack);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    if (!currentToken) return;
    setIsLoading(true);

    try {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        await deleteToken(messaging);
      }
      await removePushSubscription(currentToken);
      setCurrentToken(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("[Push] Erro ao desativar:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentToken]);

  return {
    permission,
    isSubscribed,
    isLoading,
    isSupported,
    subscribe,
    unsubscribe,
  };
}
