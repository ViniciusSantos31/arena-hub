import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "arena-hub/pwa",
    name: "Arena Hub",
    short_name: "ArenaHub",
    start_url: "/home",
    orientation: "portrait",
    description:
      "Plataforma de gerenciamento e análise para jogos de arena multiplayer.",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    theme_color: "#ffffff",
    scope: "/",
    background_color: "#1a1a1a",
    display: "fullscreen",
    screenshots: [
      {
        src: "/screenshots/screenshot2.png",
        sizes: "1080x1920",
        type: "image/png",
      },
      {
        src: "/screenshots/screenshot1.png",
        sizes: "1080x1920",
        type: "image/png",
      },
    ],
    protocol_handlers: [
      {
        protocol: "web+arenahub",
        url: "/?action=%s",
      },
    ],
  };
}
