import { CheckIcon } from "lucide-react";
import { AuthFormCard } from "../_components/auth-form-card";
import { SignInWithGoogle } from "./_components/sign-in-with-google";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthFormCard
      classNames={{
        container: "items-center",
        cardContent: "h-full",
        card: "w-full h-full md:max-w-xl",
      }}
    >
      <div className="flex h-full items-center p-7 md:p-10">
        <div className="mx-auto flex max-w-md flex-col items-start text-left">
          <div className="bg-primary/10 border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="bg-primary size-1.5 rounded-full" />
            Fase beta — acesso gratuito completo
          </div>

          <div className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-4xl font-bold text-transparent">
            Arena Hub
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Entre para organizar suas peladas
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed text-balance">
            Um login rápido com Google e você já pode criar partidas, confirmar
            presenças e sortear times.
          </p>

          <div className="mt-7 w-full">
            <SignInWithGoogle className="p-0 md:p-0" />
          </div>

          <div className="text-muted-foreground mt-6 grid w-full gap-2 text-left text-sm">
            <div className="flex items-start gap-2">
              <CheckIcon className="text-primary mt-0.5 size-4" />
              <span>Sem senha, sem fricção — só entrar e usar.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckIcon className="text-primary mt-0.5 size-4" />
              <span>Notificações e confirmações em tempo real.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckIcon className="text-primary mt-0.5 size-4" />
              <span>Sorteio de times equilibrados em segundos.</span>
            </div>
          </div>
        </div>
      </div>
    </AuthFormCard>
  );
}
