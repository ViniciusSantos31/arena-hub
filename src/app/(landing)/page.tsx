import { Button } from "@/components/ui/button";
import {
  BellIcon,
  CalendarIcon,
  GroupIcon,
  LayoutDashboardIcon,
  SmartphoneIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: CalendarIcon,
    title: "Partidas organizadas",
    desc: "Crie partidas, defina limite de vagas, data e local. Os membros se inscrevem com um clique.",
  },
  {
    icon: UsersIcon,
    title: "Gestão de membros",
    desc: "Aprove solicitações de entrada, gerencie funções e controle quem faz parte do seu grupo.",
  },
  {
    icon: ZapIcon,
    title: "Sorteio de times",
    desc: "Divida os jogadores confirmados em times equilibrados de forma automática e justa.",
  },
  {
    icon: BellIcon,
    title: "Notificações push",
    desc: "Avise seus membros sobre novas partidas e atualizações em tempo real.",
  },
  {
    icon: SmartphoneIcon,
    title: "App instalável",
    desc: "Instale o Arena Hub no celular como um aplicativo nativo, sem precisar de loja de apps.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Dashboard completo",
    desc: "Acompanhe o histórico de partidas e a situação dos membros em um só lugar.",
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
    desc: "Crie uma partida com data, local e vagas. Os membros confirmam presença diretamente pelo app.",
  },
  {
    step: "03",
    title: "Jogue sem burocracia",
    desc: "Com os times sorteados, é só aparecer e jogar.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 py-28 md:py-36">
        {/* <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/8 absolute top-0 left-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-3xl" />
          <div className="bg-primary/6 absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full blur-3xl" />
        </div> */}
        <div className="from-background absolute inset-0 bg-linear-to-r bg-[radial-gradient(#dedede_1px,transparent_1px)] to-transparent bg-size-[16px_16px] dark:bg-[radial-gradient(#1c1c1c_1px,transparent_1px)]"></div>
        <div className="from-background via-background/50 to-background/0 absolute inset-0 bg-radial blur-3xl"></div>

        <div className="relative container mx-auto max-w-4xl text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="bg-primary size-1.5 rounded-full" />
            Fase beta — acesso gratuito completo
          </div>

          <h1 className="text-foreground mb-6 text-5xl leading-[1.1] font-bold tracking-tight md:text-7xl">
            Chega de WhatsApp
            <br />
            <span className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-transparent">
              para organizar suas peladas
            </span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
            Arena Hub reúne tudo em um lugar: confirmações de presença, sorteio
            de times e notificações para todos.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-8 text-base">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
            >
              <Link href="/#como-funciona">Ver como funciona</Link>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="border-border/60 bg-muted/20 border-y px-4 py-24"
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
              <div
                key={item.step}
                className="border-border/60 bg-card/40 relative rounded-2xl border p-7 backdrop-blur-sm"
              >
                <div className="bg-primary/10 text-primary group-hover:bg-primary/15 mb-4 flex w-fit items-center justify-center rounded-xl p-4 text-4xl font-black transition-colors">
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

          {/* <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"> */}
          <div className="flex flex-wrap justify-center gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-card/50 border-border/60 hover:border-primary/30 hover:bg-card/70 group hover:shadow-primary/5 w-full rounded-2xl border p-6 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:max-w-xs"
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

      <section className="bg-muted/20 border-t px-4 py-24">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-primary/10 border-primary/20 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <GroupIcon className="text-primary size-3.5" />
            <span className="text-primary">Fase beta aberta</span>
          </div>

          <h2 className="text-foreground mb-4 text-4xl leading-tight font-bold md:text-5xl">
            Pronto para acabar com a
            <br />
            bagunça da pelada?
          </h2>

          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Entre na plataforma e organize tudo em minutos. Durante a fase beta,
            os recursos ficam liberados para você testar.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 px-10 text-base">
              <Link href="/auth/sign-in">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
