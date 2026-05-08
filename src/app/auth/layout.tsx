import Image from "next/image";
import SoccerField from "/public/images/soccer-field.jpg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground relative flex h-full min-h-dvh w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="landing-wash absolute inset-0" />
        <div className="landing-dots absolute inset-0 opacity-70" />
        <div className="from-background via-background/60 to-background absolute inset-0 bg-linear-to-b" />
      </div>

      <div className="relative grid h-full w-full items-stretch md:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-1 flex-col">
          <div className="bg-background flex flex-1 items-center justify-center">
            {children}
          </div>
        </div>

        <div className="border-border/60 relative hidden overflow-hidden md:flex md:flex-1">
          <div className="bg-primary/15 absolute inset-0 z-10 h-full w-full dark:hidden" />
          <Image
            priority
            src={SoccerField}
            alt="Imagem de um campo de futebol"
            fill
            className="object-cover dark:brightness-[0.15] dark:grayscale"
          />

          <div className="absolute inset-0 z-20 border-l bg-linear-to-t from-black/60 via-black/20 to-transparent" />

          <div className="absolute bottom-10 left-10 z-30 max-w-xs">
            <blockquote className="text-lg leading-snug font-medium text-white/90">
              &quot;Chega de ficar contando emoji no grupo.&quot;
            </blockquote>
            <p className="mt-3 text-xs text-white/50">
              Confirmações, sorteio de times e notificações — em um só lugar.
            </p>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground/50 bg-background h-fit border-t px-6 py-5 text-center text-xs">
        © 2026 Arena Hub
      </p>
    </div>
  );
}
