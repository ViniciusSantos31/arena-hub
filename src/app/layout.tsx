import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arena Hub",
  description:
    "A plataforma definitiva para gerenciamento de grupos e partidas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arena Hub",
  },
  formatDetection: {
    telephone: false,
  },
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/icons/apple-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "192x192",
      url: "/icons/icon-192x192.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "512x512",
      url: "/icons/icon-512x512.png",
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  interactiveWidget: "resizes-content",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  viewportFit: "auto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <meta name="apple-mobile-web-app-title" content="Arena Hub" />
      <body
        className={`${nunitoSans.variable} ${nunito.variable} bg-sidebar antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Analytics />
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
