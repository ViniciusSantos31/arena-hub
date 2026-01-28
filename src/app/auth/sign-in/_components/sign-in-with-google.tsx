"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type SignInWithGoogleProps = React.ComponentProps<"div">;

export function SignInWithGoogle({
  className,
  ...props
}: SignInWithGoogleProps) {
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/home",
    });
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
          className="h-12 w-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          onClick={handleGoogleSignIn}
        >
          <svg
            className="mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          <span className="sr-only">Login with Google</span>
          <span className="font-medium">Entrar com Google</span>
        </Button>
      </div>
    </div>
  );
}
