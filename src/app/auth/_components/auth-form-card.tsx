import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export function AuthFormCard({
  classNames,
  children,
  ...props
}: PropsWithChildren<{
  classNames?: {
    container?: string;
    card?: string;
    cardContent?: string;
  };
}>) {
  return (
    <div
      className={cn("flex h-full w-full flex-col gap-6", classNames?.container)}
      {...props}
    >
      <Card
        className={cn(
          "border-border/60 shadow-primary/5 overflow-hidden p-0 shadow-xl backdrop-blur-sm",
          classNames?.card,
        )}
      >
        <CardContent
          className={cn("bg-background p-0 px-6", classNames?.cardContent)}
        >
          {children}
        </CardContent>
      </Card>
      {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="#">Termos de Serviço</a> e{" "}
        <a href="#">Política de Privacidade</a>.
      </div> */}
    </div>
  );
}
