import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { ArrowRightCircle, InfoIcon } from "lucide-react";

export default function JoinGroupPage() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center">
      <div className="border-border flex w-full max-w-lg flex-col items-center space-y-3 rounded-lg border p-8">
        <span>Digite o código de convite do grupo</span>
        <div className="flex w-full items-center justify-center">
          <InputOTP maxLength={6} containerClassName="w-full flex-1" autoFocus>
            <InputOTPGroup className="flex w-full">
              <InputOTPSlot index={0} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={1} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={2} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={3} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={4} className="aspect-square w-full flex-1" />
              <InputOTPSlot index={5} className="aspect-square w-full flex-1" />
            </InputOTPGroup>
          </InputOTP>
          <Button className="ml-2" size={"icon"}>
            <ArrowRightCircle />
          </Button>
        </div>
        <section>
          <Alert>
            <InfoIcon />
            <AlertTitle>Não tem um código?</AlertTitle>
            <AlertDescription className="line-clamp-2">
              Solicite ao administrador do grupo para gerar um código de convite
            </AlertDescription>
          </Alert>
        </section>
        <section className="flex w-full flex-col items-center justify-center space-y-2 rounded-xl border px-2">
          <div className="flex w-full items-center">
            <div className="border-border bg-accent relative flex aspect-square h-11 w-11 flex-1 overflow-clip rounded-lg border" />

            <div className="from-background inset-0 bottom-0 flex h-full w-full flex-col justify-end bg-linear-to-t via-transparent to-transparent p-2">
              <span className="text-foreground line-clamp-2 text-sm font-bold md:text-base">
                Inimigos do código?
              </span>
              <span className="text-muted-foreground text-xs md:text-sm">
                12 participantes
              </span>
            </div>
            <Button variant={"default"} className="w-fit">
              Entrar
            </Button>
          </div>
        </section>

        <section className="flex w-full flex-col items-center space-y-1">
          <div className="text-muted-foreground inline-flex w-full items-center justify-center gap-2 text-sm">
            <Separator className="flex-1" /> ou <Separator className="flex-1" />
          </div>
          <div className="flex w-full max-w-md flex-col justify-center gap-1">
            <Button variant={"outline"}>Encontre grupos</Button>
            <Button variant={"link"} className="w-fit self-center px-0">
              Crie um novo grupo
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
