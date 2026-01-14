import z from "zod/v4";

export const createMatchSchema = z
  .object({
    title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
    description: z
      .string()
      .min(10, "A descrição deve ter no mínimo 10 caracteres"),
    date: z.date(),
    time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
    sport: z.string().min(2, "Selecione um esporte"),
    category: z.string().min(2, "Selecione uma categoria"),
    location: z.string().min(5, "O local deve ter no mínimo 5 caracteres"),
    maxPlayers: z
      .number()
      .min(2, "O número máximo de jogadores deve ser pelo menos 2")
      .max(100, "O número máximo de jogadores não pode exceder 100"),
    pricePerPerson: z
      .number()
      .min(0, "O preço por pessoa não pode ser negativo"),
    isFree: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.isFree) {
        return data.pricePerPerson === 0;
      }
      return data.pricePerPerson > 0;
    },
    {
      message: "O preço por pessoa deve ser 0 se a partida for gratuita",
      path: ["pricePerPerson"],
    },
  );

export type CreateMatchFormData = z.infer<typeof createMatchSchema>;
