"use client";

import { Button } from "@/components/ui/button";
import { HomeIcon, LockKeyholeIcon, Undo2Icon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-dvh w-full flex-col justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="landing-wash absolute inset-0 opacity-70" />
        <div className="landing-dots absolute inset-0 opacity-50" />
        <div className="from-background via-background/70 to-background absolute inset-0 bg-linear-to-b" />
      </div>

      <div className="relative z-0 mx-auto flex max-w-lg flex-col gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="mx-auto flex items-center justify-center">
            <div className="bg-muted/80 ring-border/50 dark:shadow-primary/15 relative flex size-14 items-center justify-center rounded-2xl shadow-lg ring-1 backdrop-blur-sm dark:shadow-xl">
              <LockKeyholeIcon className="text-primary h-7 w-7" />
              <span className="bg-destructive border-background absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white">
                !
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Erro 401
            </p>
            <h1 className="text-foreground text-2xl font-bold tracking-tight text-balance">
              Acesso não autorizado
            </h1>
            <p className="text-muted-foreground mx-auto max-w-prose text-sm leading-relaxed text-pretty">
              Você não tem permissão para acessar esta página. Se você acredita
              que isso é um erro, entre em contato com o administrador.
            </p>
          </div>
        </div>

        <div className="border-border/40 flex w-full flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-center">
          <Button asChild variant="secondary" className="w-full sm:w-auto">
            <Link href="/home">
              <HomeIcon />
              Ir para o início
            </Link>
          </Button>

          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Undo2Icon />
            Voltar
          </Button>

          {/* <Button asChild className="w-full sm:w-auto">
            <Link href="/auth/sign-in">
              <LogInIcon />
              Fazer login
            </Link>
          </Button> */}
        </div>
      </div>
    </main>
  );
}
