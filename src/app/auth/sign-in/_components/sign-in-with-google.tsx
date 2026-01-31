"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type SignInWithGoogleProps = React.ComponentProps<"div">;

export function SignInWithGoogle({
  className,
  ...props
}: SignInWithGoogleProps) {
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/home";

  const handleGoogleSignIn = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch {
      toast.error(
        "Ocorreu um erro ao tentar entrar com o Google. Por favor, tente novamente.",
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("w-full p-6 md:p-8", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent">
            Arena Hub
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm leading-relaxed text-balance">
            Sua jornada no universo dos games começa aqui. Conecte-se e explore
            um mundo de possibilidades.
          </p>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled={loading}
          className="h-12 w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          onClick={handleGoogleSignIn}
        >
          <svg
            className="size-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-medium">Continuar com Google</span>
        </Button>
      </div>
    </div>
  );
}
