import { categoriesIds } from "@/utils/categories";
import { sportsIds } from "@/utils/sports";
import z from "zod/v4";

const MIN_PRICE_REAIS = 5;

export const createMatchSchema = z
  .object({
    title: z.string().min(3, "O título deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    date: z.date(),
    sport: z.enum(sportsIds, {
      error: "Selecione um esporte",
    }),
    category: z.enum(categoriesIds, {
      error: "Selecione uma categoria",
    }),
    time: z.string().regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
    location: z.string().min(5, "O local deve ter no mínimo 5 caracteres"),
    minPlayers: z
      .number()
      .min(2, "O número mínimo de jogadores deve ser pelo menos 2")
      .max(100, "O número mínimo de jogadores não pode exceder 100"),
    maxPlayers: z
      .number()
      .min(2, "O número máximo de jogadores deve ser pelo menos 2")
      .max(100, "O número máximo de jogadores não pode exceder 100"),
    isPaid: z.boolean(),
    priceReais: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isPaid) return;

    if (
      data.priceReais === undefined ||
      Number.isNaN(data.priceReais) ||
      data.priceReais <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["priceReais"],
        message: "Informe o valor por jogador.",
      });
      return;
    }

    if (data.priceReais < MIN_PRICE_REAIS) {
      ctx.addIssue({
        code: "custom",
        path: ["priceReais"],
        message: `O valor mínimo é R$ ${MIN_PRICE_REAIS.toFixed(2).replace(".", ",")} por jogador.`,
      });
    }
  });

export type CreateMatchFormData = z.infer<typeof createMatchSchema>;
