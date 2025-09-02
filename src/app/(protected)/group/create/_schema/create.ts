import z from "zod";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter no mínimo 2 caracteres")
    .max(50, "O nome deve ter no máximo 50 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "A descrição deve ter no mínimo 10 caracteres")
    .max(200, "A descrição deve ter no máximo 200 caracteres"),
  // image: z.file(),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;
