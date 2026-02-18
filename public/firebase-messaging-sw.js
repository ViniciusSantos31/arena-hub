// public/firebase-messaging-sw.js
// Este arquivo é necessário para o Firebase Messaging
// Mas delegamos tudo para o nosso service worker principal em /sw.js

importScripts("/sw.js");

// O Firebase vai registrar handlers aqui automaticamente quando getToken() for chamado
console.log("[Firebase SW] Carregado");
