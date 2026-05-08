import Link from "next/link";
import { LandingHeader } from "./_components/landing-header";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background text-foreground relative h-full min-h-screen overflow-x-hidden overflow-y-scroll scroll-smooth">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="landing-wash absolute inset-0" />
        <div className="landing-dots absolute inset-0 opacity-70" />
        <div className="from-background via-background/60 to-background absolute inset-0 bg-linear-to-b" />
      </div>

      <LandingHeader />

      {children}

      <footer className="border-border/60 border-t px-4 py-10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link
            href="/"
            className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-lg font-bold text-transparent"
          >
            Arena Hub
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <Link
              href="/#como-funciona"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Como funciona
            </Link>
            <Link
              href="/#tutorial"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Tutorial
            </Link>
            <Link
              href="/#recursos"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="/sobre"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Sobre nós
            </Link>
            <Link
              href="https://forms.gle/3fdBhX9aRTDskp4eA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Suporte
            </Link>
          </div>

          <p className="text-muted-foreground text-sm">
            © 2026 Arena Hub. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
