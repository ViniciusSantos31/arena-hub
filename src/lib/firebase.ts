// lib/firebase.ts
import { getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializa apenas uma vez
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Messaging só funciona no cliente e precisa de service worker
export async function getFirebaseMessaging() {
  try {
    const supported = await isSupported();
    if (!supported) return null;

    // Usa nosso service worker customizado em vez do padrão
    const messaging = getMessaging(app);

    // Registra nosso SW se ainda não estiver registrado
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log("[Firebase] Service Worker registrado:", registration.scope);
    }

    return messaging;
  } catch (error) {
    console.error("[Firebase] Messaging não suportado:", error);
    return null;
  }
}
