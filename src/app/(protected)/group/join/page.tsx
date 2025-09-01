import { Button } from "@/components/ui/button";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function JoinGroupPage() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center space-y-3 px-4">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-primary text-xl font-bold">Entrar em um grupo</h1>
        <span className="text-muted-foreground text-sm">
          Digite o código de convite do grupo
        </span>
      </div>
      <div className="flex w-full max-w-md flex-col items-center">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button className="mt-2 w-fit" size={"sm"}>
          Entrar no grupo
        </Button>
      </div>
      <span>
        <Button variant={"link"}>Criar um novo grupo</Button>
      </span>
    </main>
  );
}
