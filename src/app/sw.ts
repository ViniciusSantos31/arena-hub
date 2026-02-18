// app/sw.ts
/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
} & SerwistGlobalConfig;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// ─── Firebase Cloud Messaging ─────────────────────────────────────────────────

// Este handler intercepta mensagens FCM em background
self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  try {
    const payload = event.data.json() as {
      notification?: {
        title: string;
        body: string;
        icon?: string;
        image?: string;
      };
      data?: {
        title: string;
        url?: string;
        tag?: string;
      };
    };

    // Se tem notification, é FCM. Se não tem, pode ser outro tipo de push.
    const title =
      payload.notification?.title || payload.data?.title || "Nova notificação";
    const options: NotificationOptions = {
      body: payload.notification?.body || "",
      icon: payload.notification?.icon || "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      data: { url: payload.data?.url || "/" },
      tag: payload.data?.tag,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("[SW] Erro ao processar notificação:", error);
  }
});

// ─── Clique na notificação: abre a URL correta ────────────────────────────────
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const url = (event.notification.data as { url?: string })?.url ?? "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList: readonly WindowClient[]) => {
        const existingClient = clientList.find((c: WindowClient) =>
          c.url.includes(self.location.origin),
        );
        if (existingClient) {
          existingClient.focus();
          return existingClient.navigate(url);
        }
        return self.clients.openWindow(url);
      }),
  );
});
