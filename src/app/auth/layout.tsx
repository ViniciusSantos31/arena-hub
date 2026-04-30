import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";
import SoccerField from "/public/images/soccer-field.jpg";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground relative min-h-dvh w-full overflow-hidden">
      {/* Background decorativo (mesmo padrão da landing) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="landing-wash absolute inset-0" />
        <div className="landing-dots absolute inset-0 opacity-70" />
        <div className="from-background via-background/60 to-background absolute inset-0 bg-linear-to-b" />
      </div>

      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl items-stretch gap-8 px-6 py-10 md:grid-cols-2 md:gap-10 md:px-10">
        <div className="flex items-center">
          <div className="h-full w-full">{children}</div>
        </div>

        <div className="border-border/60 relative hidden overflow-hidden rounded-3xl border md:block">
          <div className="bg-primary/20 absolute inset-0 z-10 h-full w-full dark:hidden" />
          <Image
            priority
            src={SoccerField}
            alt="Imagem de um campo de futebol"
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
          />

          <div className="from-background/70 via-background/10 absolute inset-0 z-20 bg-linear-to-t to-transparent" />
          <div className="absolute bottom-8 left-8 z-30 max-w-md">
            <div className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent">
              Arena Hub
            </div>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Confirmações, sorteio de times e notificações — tudo em um só
              lugar.
            </p>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}
