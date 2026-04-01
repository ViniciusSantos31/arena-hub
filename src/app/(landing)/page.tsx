"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  BellIcon,
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  GroupIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SparklesIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: CalendarIcon,
    title: "Partidas organizadas",
    desc: "Crie partidas, defina valor por jogador, limite de vagas e data. Os membros se inscrevem com um clique.",
  },
  {
    icon: UsersIcon,
    title: "Gestão de membros",
    desc: "Aprove solicitações de entrada, gerencie funções e controle quem faz parte do seu grupo.",
  },
  {
    icon: CreditCardIcon,
    title: "Pagamentos integrados",
    desc: "Cobrança automática por partida via cartão de crédito. Cartões salvos para pagamentos mais rápidos.",
  },
  {
    icon: SparklesIcon,
    title: "Assinatura mensal",
    desc: "Membros podem assinar um plano mensal e ficam isentos de pagar individualmente por cada partida.",
  },
  {
    icon: ZapIcon,
    title: "Sorteio de times",
    desc: "Divida os jogadores confirmados em times equilibrados de forma automática e justa.",
  },
  {
    icon: BellIcon,
    title: "Notificações push",
    desc: "Avise seus membros sobre novas partidas, pagamentos e atualizações em tempo real.",
  },
  {
    icon: SmartphoneIcon,
    title: "App instalável",
    desc: "Instale o Arena Hub no celular como um aplicativo nativo, sem precisar de loja de apps.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Dashboard completo",
    desc: "Acompanhe o histórico de partidas, pagamentos e a situação dos membros em um só lugar.",
  },
];

const steps = [
  {
    step: "01",
    title: "Crie seu grupo",
    desc: "Cadastre-se, crie um grupo para o seu time e convide os membros com um link ou código único.",
  },
  {
    step: "02",
    title: "Organize as partidas",
    desc: "Crie uma partida com data, local, valor e vagas. Os membros confirmam presença e pagam diretamente pelo app.",
  },
  {
    step: "03",
    title: "Jogue sem burocracia",
    desc: "Com o pagamento resolvido e os times sorteados, é só aparecer e jogar.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="border-border/60 sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent">
            Arena Hub
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#como-funciona"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Como funciona
            </Link>
            <Link
              href="#recursos"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Recursos
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Criar conta</Link>
            </Button>
            <ModeToggle />
          </div>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-28 md:py-36">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/8 absolute top-0 left-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl" />
          <div className="bg-primary/6 absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto max-w-4xl text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="bg-primary size-1.5 rounded-full" />
            Fase beta — acesso gratuito completo
          </div>

          <h1 className="text-foreground mb-6 text-5xl leading-[1.1] font-bold tracking-tight md:text-7xl">
            Chega de WhatsApp
            <br />
            <span className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-transparent">
              para organizar suas peladas
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
            Arena Hub reúne tudo em um lugar: confirmações de presença,
            pagamentos automáticos, sorteio de times e notificações para todos.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/auth/sign-up">Começar gratuitamente</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
            >
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </div>

          <p className="text-muted-foreground mt-4 text-sm">
            Sem cartão de crédito. Sem limite de grupos.
          </p>
        </div>
      </section>

      {/* ── Como funciona ──────────────────────────────────────────────── */}
      <section
        id="como-funciona"
        className="border-border/60 border-y bg-muted/30 py-24 px-4"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <h2 className="text-foreground mb-3 text-4xl font-bold md:text-5xl">
              Simples assim
            </h2>
            <p className="text-muted-foreground text-lg">
              Do cadastro à quadra em três passos
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-primary/20 mb-4 text-6xl font-bold leading-none">
                  {item.step}
                </div>
                <h3 className="text-foreground mb-2 text-xl font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recursos ───────────────────────────────────────────────────── */}
      <section id="recursos" className="px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-foreground mb-3 text-4xl font-bold md:text-5xl">
              Tudo que você precisa
            </h2>
            <p className="text-muted-foreground text-lg">
              Funcionalidades pensadas para quem organiza times regularmente
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card border-border/60 hover:border-primary/30 hover:bg-primary/5 group rounded-2xl border p-6 transition-all duration-200"
                >
                  <div className="bg-primary/10 group-hover:bg-primary/15 mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
                    <Icon className="text-primary size-5" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Destaque de pagamentos ─────────────────────────────────────── */}
      <section className="border-border/60 border-y bg-muted/30 px-4 py-24">
        <div className="container mx-auto max-w-5xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="bg-primary/10 border-primary/20 text-primary mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
                <ShieldCheckIcon className="size-3.5" />
                Powered by Stripe
              </div>
              <h2 className="text-foreground mb-4 text-4xl font-bold leading-tight md:text-5xl">
                Pagamentos sem dor de cabeça
              </h2>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                Cada jogador paga a sua parte diretamente pelo app. Sem fiado,
                sem transferência manual, sem confusão.
              </p>

              <ul className="space-y-3">
                {[
                  "Cobrança por partida via cartão de crédito",
                  "Cartões salvos para pagamento com 1 clique",
                  "Plano de assinatura mensal para isenção por partida",
                  "Histórico completo de pagamentos",
                  "Cancelamento e reembolso gerenciados automaticamente",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="bg-primary/15 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                      <CheckIcon className="text-primary size-3" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card border-border/60 rounded-3xl border p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-foreground font-semibold">
                  Resumo da partida
                </span>
                <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                  Confirmada
                </span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Data", value: "Sáb, 05 Abr · 20h" },
                  { label: "Local", value: "Quadra Central" },
                  { label: "Jogadores confirmados", value: "12 / 14" },
                  { label: "Valor por jogador", value: "R$ 25,00" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-muted-foreground text-sm">
                      {row.label}
                    </span>
                    <span className="text-foreground text-sm font-medium">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-border/60 mt-6 border-t pt-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Seu pagamento
                  </span>
                  <span className="text-primary font-semibold">
                    R$ 25,00 — Pago
                  </span>
                </div>
                <div className="bg-primary/10 border-primary/20 flex items-center gap-2 rounded-xl border px-4 py-3">
                  <SparklesIcon className="text-primary size-4 shrink-0" />
                  <span className="text-muted-foreground text-xs">
                    Assinante mensal — isento de cobrança por partida
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Beta CTA ───────────────────────────────────────────────────── */}
      <section className="px-4 py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-primary/10 border-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <GroupIcon className="text-primary size-3.5" />
            <span className="text-primary">Fase beta aberta</span>
          </div>

          <h2 className="text-foreground mb-4 text-4xl font-bold leading-tight md:text-5xl">
            Pronto para acabar com a
            <br />
            bagunça da pelada?
          </h2>

          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Crie sua conta gratuitamente. Durante a fase beta, todos os recursos
            estão disponíveis sem custo.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-10 text-base">
              <Link href="/auth/sign-up">Criar conta grátis</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-10 text-base"
            >
              <Link href="/auth/sign-in">Já tenho conta</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-border/60 border-t py-10 px-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
            Arena Hub
          </div>

          <div className="flex items-center gap-8">
            <Link
              href="#como-funciona"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Como funciona
            </Link>
            <Link
              href="#recursos"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Recursos
            </Link>
            <Link
              href="https://forms.gle/3fdBhX9aRTDskp4eA"
              target="_blank"
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
