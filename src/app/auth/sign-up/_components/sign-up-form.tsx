"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputField } from "@/components/ui/input/field";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useForm } from "react-hook-form";
import { SignUpFormValues, signUpSchema } from "../_schema/sign-up";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const methods = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { formState } = methods;

  const onSubmit = async (data: SignUpFormValues) => {
    await authClient.signUp.email(data, {
      onSuccess: () => {
        redirect("/home");
      },
    });
  };

  return (
    <Form {...methods}>
      <form
        className={cn("p-6 md:p-8", className)}
        onSubmit={methods.handleSubmit(onSubmit)}
        {...props}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold">Crie sua conta</h1>
            <p className="text-muted-foreground text-balance">
              Cadastre-se para começar
            </p>
          </div>
          <InputField name="name" label="Nome" placeholder="Seu nome" />
          <InputField name="email" label="Email" placeholder="m@exemplo.com" />
          <InputField
            name="password"
            label="Senha"
            type="password"
            placeholder="********"
          />

          <Button
            type="submit"
            disabled={formState.isSubmitting || !formState.isValid}
            className="w-full"
          >
            Criar conta
          </Button>
          <div className="text-center text-sm">
            Já tem uma conta?{" "}
            <a href="/auth/sign-in" className="underline underline-offset-4">
              Faça login
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
