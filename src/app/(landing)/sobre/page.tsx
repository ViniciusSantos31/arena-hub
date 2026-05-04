import { Button } from "@/components/ui/button";
import { HeartIcon, SparklesIcon, TargetIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre nós | Arena Hub",
  description:
    "Conheça a origem do Arena Hub: de um sistema para partidas de vôlei entre amigos a uma plataforma para organizar peladas com simplicidade.",
};

const values = [
  {
    icon: SparklesIcon,
    title: "Simplicidade",
    desc: "Menos ruído, mais clareza: presenças, vagas e times no mesmo fluxo.",
  },
  {
    icon: TargetIcon,
    title: "Quem organiza no centro",
    desc: "Ferramentas pensadas para quem cuida do grupo e precisa de controle sem complicação.",
  },
  {
    icon: HeartIcon,
    title: "Nascido na quadra",
    desc: "Cada recurso veio de necessidade real — primeiro no dia a dia, depois na plataforma.",
  },
];

export default function SobrePage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="bg-primary/8 absolute top-1/4 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-3xl text-center">
          <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <HeartIcon className="size-3.5" />
            Nossa história
          </div>

          <h1 className="text-foreground mb-5 text-4xl font-bold tracking-tight md:text-5xl">
            Sobre o{" "}
            <span className="from-primary to-primary/60 bg-linear-to-r bg-clip-text text-transparent">
              Arena Hub
            </span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed md:text-xl">
            Uma ferramenta que começou pequena — para resolver um problema
            concreto — e cresceu com a vontade de ajudar qualquer grupo a
            organizar melhor suas peladas.
          </p>
        </div>
      </section>

      <section className="border-border/60 bg-muted/20 border-y px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-14">
            <div className="text-muted-foreground space-y-5 leading-relaxed">
              <p>
                O Arena Hub surgiu como evolução de um sistema que eu tinha
                criado para gerenciar as partidas de vôlei de um grupo de
                amigos. Na prática, era sobre parar de perder tempo em planilhas
                e mensagens soltas — e passar a ter um lugar só para datas,
                confirmações e times.
              </p>
              <p>
                Daí veio a ideia de abrir isso para todos que desejam o mesmo
                controle nas suas peladas: seja vôlei, futebol ou outro esporte
                em grupo, o objetivo continua o mesmo —{" "}
                <span className="text-foreground font-medium">
                  menos bagunça, mais jogo.
                </span>
              </p>
            </div>

            <div className="border-border/60 bg-card/40 relative rounded-2xl border p-8 backdrop-blur-sm">
              <p className="text-primary/50 absolute top-8 -left-4 mb-3 -translate-y-1/2 text-9xl leading-0 font-bold">
                &ldquo;
              </p>
              <p className="text-foreground text-lg leading-relaxed font-medium">
                Se funcionou para organizar a nossa pelada, faz sentido
                compartilhar com quem também cansa de remendar processo no
                WhatsApp.
              </p>
              <p className="text-primary/50 absolute -right-8 bottom-0 mb-3 text-9xl leading-0 font-bold">
                &rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-3 text-3xl font-bold md:text-4xl">
              O que nos move
            </h2>
            <p className="text-muted-foreground text-lg">
              Princípios simples, herdados de quem organiza jogo toda semana
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="bg-card/50 border-border/60 rounded-2xl border p-6 backdrop-blur-sm"
                >
                  <div className="bg-primary/10 mb-4 flex h-10 w-10 items-center justify-center rounded-xl">
                    <Icon className="text-primary size-5" />
                  </div>
                  <h3 className="text-foreground mb-2 font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/20 border-t px-4 py-20">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold md:text-4xl">
            Faça parte
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Entre, crie seu grupo e veja na prática como fica mais fácil
            coordenar a próxima pelada.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:justify-center">
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
    </>
  );
}
