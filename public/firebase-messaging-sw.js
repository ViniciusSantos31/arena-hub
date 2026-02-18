// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

// IMPORTANTE: Substitua esses valores pelas suas credenciais do Firebase
// Você precisa copiar isso manualmente do Firebase Console
firebase.initializeApp({
  apiKey: "AIzaSyBKlop-mIWUi91GrlCxvuSElb1-8nr8FYw",
  authDomain: "arena-hub-919ae.firebaseapp.com",
  projectId: "arena-hub-919ae",
  storageBucket: "arena-hub-919ae.firebasestorage.app",
  messagingSenderId: "282312734076",
  appId: "1:282312734076:web:d3e5e70a2099c73de5a0f9",
});

const messaging = firebase.messaging();

// Exibe notificações recebidas em background
messaging.onBackgroundMessage((payload) => {
  console.log("[Firebase SW] Notificação recebida:", payload);

  const notificationTitle = payload.notification?.title || "Nova notificação";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: payload.notification?.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Cliques na notificação
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/home";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
