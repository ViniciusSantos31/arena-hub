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
  maxPlayers: z
    .number()
    .min(2, "O número mínimo de jogadores é 2")
    .max(100, "O número máximo de jogadores é 100"),
  isPrivate: z.boolean().optional(),
});

export type CreateGroupFormData = z.infer<typeof createGroupSchema>;
