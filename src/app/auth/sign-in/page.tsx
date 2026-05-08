import Image from "next/image";
import { AuthFormCard } from "../_components/auth-form-card";
import { SignInWithGoogle } from "./_components/sign-in-with-google";

import ArenaHubIcon from "../../../../public/icon.png";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthFormCard
      classNames={{
        container: "items-center relative z-10 overflow-clip ",
        cardContent: "h-full",
        card: "w-full  h-full border-0 shadow-none backdrop-blur-none",
      }}
    >
      <div className="z-20 flex h-full items-center justify-center bg-linear-to-r! bg-[radial-gradient(#dedede_1px,transparent_1px)]! to-transparent! bg-size-[16px_16px]! dark:bg-[radial-gradient(#111111_1px,transparent_1px)]!">
        <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary/10 border-primary/20 flex size-14 items-center justify-center rounded-2xl border">
              <span className="from-primary to-primary/70 bg-linear-to-r bg-clip-text text-lg font-black text-transparent">
                <Image
                  src={ArenaHubIcon}
                  alt="Arena Hub"
                  width={60}
                  height={60}
                  className="size-full object-contain"
                />
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight">Arena Hub</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Chega de WhatsApp para organizar peladas.
              </p>
            </div>
          </div>

          <div className="w-full">
            <SignInWithGoogle className="z-20 p-0 md:p-0" />
          </div>

          <p className="text-muted-foreground/70 text-xs">
            Um clique. Sem senha. Sem cadastro longo.
          </p>
        </div>
      </div>
    </AuthFormCard>
  );
}
