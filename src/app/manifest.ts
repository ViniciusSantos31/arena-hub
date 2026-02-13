import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arena Hub",
    short_name: "ArenaHub",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
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
    display: "standalone",
    screenshots: [
      {
        src: "/screenshots/screenshot1.png",
        sizes: "1080x1920",
        type: "image/png",
      },
    ],
    display_override: ["standalone", "fullscreen"],
    protocol_handlers: [
      {
        protocol: "web+arenahub",
        url: "/?action=%s",
      },
    ],
  };
}
