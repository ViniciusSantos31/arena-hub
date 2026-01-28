import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { PropsWithChildren } from "react";
import SoccerField from "/public/images/soccer-field.jpg";

export function AuthFormCard({
  classNames,
  children,
  ...props
}: PropsWithChildren<{
  classNames?: {
    container?: string;
    card?: string;
    cardContent?: string;
    imageContainer?: string;
  };
}>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-6", classNames?.container)}
      {...props}
    >
      <Card className={cn("overflow-hidden p-0", classNames?.card)}>
        <CardContent
          className={cn("grid p-0 md:grid-cols-2", classNames?.cardContent)}
        >
          {children}
          <div
            className={cn(
              "bg-primary/10 relative hidden md:block",
              classNames?.imageContainer,
            )}
          >
            <div className="bg-primary/20 absolute inset-0 z-10 h-full w-full dark:hidden" />
            <Image
              width={1000}
              height={1000}
              priority
              src={SoccerField}
              alt="Imagem de um campo de futebol"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Ao clicar em continuar, você concorda com nossos{" "}
        <a href="#">Termos de Serviço</a> e{" "}
        <a href="#">Política de Privacidade</a>.
      </div>
    </div>
  );
}
