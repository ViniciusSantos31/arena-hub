import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HomeIcon, SearchXIcon, Undo2Icon } from "lucide-react";

export default function NotFound() {
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
            <div className="bg-muted/80 ring-border/50 dark:shadow-primary/15 flex size-14 items-center justify-center rounded-2xl shadow-lg ring-1 backdrop-blur-sm dark:shadow-xl">
              <SearchXIcon className="text-primary h-7 w-7" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-bold tracking-tight text-balance">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground mx-auto max-w-prose text-sm leading-relaxed text-pretty">
              Esse endereço não existe (ou mudou). Se você veio por um link,
              tenta voltar e navegar pelo menu.
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

          <Button asChild className="w-full sm:w-auto">
            <Link href=".." replace>
              <Undo2Icon />
              Voltar
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
