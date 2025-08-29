import z from "zod";

export const signUpSchema = z.object({
  name: z
    .string({
      error: "Nome é obrigatório",
    })
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
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

export type SignUpFormValues = z.infer<typeof signUpSchema>;
