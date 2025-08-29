import z from "zod";

export const signInSchema = z.object({
  email: z
    .string({
      error: "Email é obrigatório",
    })
    .trim()
    .min(1, "Email é obrigatório"),
  password: z
    .string({
      error: "Senha é obrigatória",
    })
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .max(100, "Senha deve ter no máximo 100 caracteres"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
