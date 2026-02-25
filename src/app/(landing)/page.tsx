"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background text-foreground relative min-h-screen scroll-smooth">
      {/* Header */}
      <header className="border-border/50 sticky top-0 z-50 border-b backdrop-blur-md">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
            Arena Hub
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="hover:text-primary transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="#pricing"
              className="hover:text-primary transition-colors"
            >
              Preços
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="default">
              <Link href="/auth/sign-in">Começar</Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto overflow-hidden px-4 py-32 text-center">
        <div className="relative inset-0 z-10 animate-pulse">
          <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
          <div className="bg-primary/10 absolute top-0 left-1/4 h-96 w-96 animate-pulse rounded-full blur-3xl" />
          <div className="bg-primary/10 absolute right-1/4 bottom-0 h-96 w-96 animate-pulse rounded-full blur-3xl delay-1000" />
        </div>
        <div className="animate-fade-in space-y-6">
          <div className="inline-block">
            <span className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 rounded-full border px-4 py-2 text-sm font-semibold transition-colors">
              ✨ Bem-vindo ao Arena Hub
            </span>
          </div>
          <h1 className="from-primary via-primary/80 to-primary/60 mb-6 bg-gradient-to-r bg-clip-text text-6xl leading-tight font-bold text-transparent md:text-7xl">
            Plataforma definitiva para jogos competitivos
          </h1>
          <p className="text-muted-foreground line-height mx-auto mb-8 max-w-3xl text-lg leading-relaxed md:text-2xl">
            Gerenciamento completo de torneios, partidas e equipes em uma única
            plataforma intuitiva e poderosa
          </p>
          <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="from-primary to-primary/80 hover:shadow-primary/50 h-12 rounded-lg bg-gradient-to-r px-8 text-base transition-all hover:shadow-lg"
            >
              <Link href="/auth/sign-in">Começar gratuitamente</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary/20 hover:bg-primary/5 h-12 rounded-lg px-8 text-base"
            >
              <Link href="#features">Explorar recursos</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="border-primary/10 mt-20 grid grid-cols-3 gap-8 border-t pt-20">
          <div className="space-y-2">
            <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              10K+
            </div>
            <p className="text-muted-foreground">Usuários ativos</p>
          </div>
          <div className="space-y-2">
            <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              500+
            </div>
            <p className="text-muted-foreground">Partidas realizadas</p>
          </div>
          <div className="space-y-2">
            <div className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              99.9%
            </div>
            <p className="text-muted-foreground">Uptime</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-5xl font-bold md:text-6xl">
              Recursos poderosos
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Tudo que você precisa para gerenciar competições de forma
              profissional
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🎮",
                title: "Gerenciamento de Partidas",
                desc: "Crie, organize e gerencie partidas com inscrições automáticas e controle completo de resultados",
              },
              {
                icon: "👥",
                title: "Colaboração em Equipe",
                desc: "Organize equipes, acompanhe estatísticas de jogadores e coordene com ferramentas avançadas",
              },
              {
                icon: "📱",
                title: "Aplicativo Instalável",
                desc: "Instale o Arena Hub no seu celular como um app nativo para acesso rápido",
              },
              {
                icon: "🔔",
                title: "Notificações em Tempo Real",
                desc: "Mantenha todos informados com notificações automáticas de atualizações",
              },
              {
                icon: "🌙",
                title: "Temas Personalizáveis",
                desc: "Escolha entre modo claro e escuro com cores adaptáveis ao seu gosto",
              },
              {
                icon: "⚡",
                title: "Performance Otimizada",
                desc: "Plataforma rápida e responsiva para melhor experiência de usuário",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-card border-primary/10 hover:border-primary/30 hover:bg-primary/5 hover:shadow-primary/10 rounded-2xl border p-8 transition-all duration-300 hover:shadow-xl"
              >
                <div className="mb-4 text-4xl transition-transform">
                  {feature.icon}
                </div>
                <h3 className="group-hover:text-primary mb-3 text-xl font-semibold transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="from-background/5 to-background/10 relative overflow-hidden border-y bg-gradient-to-b py-32"
      >
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-5xl font-bold md:text-6xl">
            Planos em breve
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            Estamos preparando planos especiais para você
          </p>
          <p className="text-primary mt-8 text-base font-semibold">
            🎉 Por enquanto, todos têm acesso completo durante a fase beta!
          </p>
          <Button
            asChild
            size="lg"
            className="from-primary to-primary/80 hover:shadow-primary/50 mt-8 h-12 rounded-lg bg-gradient-to-r px-8 text-base transition-all hover:shadow-lg"
          >
            <Link href="/auth/sign-in">Comece agora</Link>
          </Button>
        </div>
        <div className="bg-primary/10 absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-primary absolute top-10 right-0 hidden size-11/12 translate-x-1/2 rotate-45 lg:block" />
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="bg-primary/5 absolute top-0 left-1/4 h-72 w-72 animate-pulse rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute right-1/4 bottom-0 h-72 w-72 animate-pulse rounded-full blur-3xl delay-1000" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="border-primary/20 from-primary/10 via-primary/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br to-transparent p-12 backdrop-blur-sm md:p-24">
            {/* Gradient Overlay */}
            <div className="from-primary/10 absolute inset-0 bg-gradient-to-r to-transparent opacity-50" />

            <div className="relative z-10 space-y-8">
              <div className="inline-block">
                <span className="bg-primary/15 border-primary/30 text-primary rounded-full border px-4 py-2 text-sm font-semibold">
                  🚀 Comece agora
                </span>
              </div>

              <div className="space-y-4">
                <h2 className="from-primary via-primary/90 to-primary/70 bg-gradient-to-r bg-clip-text text-5xl leading-tight font-bold text-transparent md:text-6xl">
                  Pronto para começar?
                </h2>
                <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed md:text-xl">
                  Junte-se a milhares de organizadores e jogadores que já
                  confiam no Arena Hub. Crie sua conta gratuitamente e comece a
                  gerenciar seus torneios.
                </p>
              </div>

              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="from-primary to-primary/80 hover:shadow-primary/50 h-12 rounded-lg bg-gradient-to-r px-8 text-base font-semibold transition-all hover:scale-105 hover:shadow-xl"
                >
                  <Link href="/auth/sign-in">Criar conta gratuitamente</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary/30 hover:bg-primary/10 hover:border-primary/50 h-12 rounded-lg px-8 text-base font-semibold transition-all"
                >
                  <Link href="#features">Conhecer recursos</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-primary/10 bg-background/80 border-t py-12 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="mb-8 grid gap-12 md:grid-cols-4">
            <div>
              <div className="from-primary to-primary/60 mb-4 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent">
                Arena Hub
              </div>
              <p className="text-muted-foreground text-sm">
                A plataforma definitiva para gerenciamento de jogos competitivos
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Produto</h4>
              <div className="text-muted-foreground space-y-2 text-sm">
                <Link
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Recursos
                </Link>
                <br />
                <Link
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  Preços
                </Link>
                <br />
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Empresa</h4>
              <div className="text-muted-foreground space-y-2 text-sm">
                <Link href="#" className="hover:text-primary transition-colors">
                  Sobre
                </Link>
                <br />
                <Link href="#" className="hover:text-primary transition-colors">
                  Contato
                </Link>
                <br />
                <Link
                  href="https://forms.gle/3fdBhX9aRTDskp4eA"
                  target="_blank"
                  className="hover:text-primary transition-colors"
                >
                  Suporte
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <div className="text-muted-foreground space-y-2 text-sm">
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacidade
                </Link>
                <br />
                <Link href="#" className="hover:text-primary transition-colors">
                  Termos
                </Link>
                <br />
                <Link href="#" className="hover:text-primary transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
          <div className="border-primary/10 text-muted-foreground border-t pt-8 text-center text-sm">
            © 2026 Arena Hub. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
