import { PAYMENT_CONFIG } from "@/lib/payments";
import { categoriesIds } from "@/utils/categories";
import { sportsIds } from "@/utils/sports";
import z from "zod/v4";

export const createMatchSchema = z.object({
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
  isPaid: z.boolean().optional().default(false),
  // Valor total da partida em reais (ex: 200.00) — convertido para centavos ao salvar
  totalPrice: z
    .number()
    .min(
      PAYMENT_CONFIG.MIN_PRICE_PER_PLAYER_CENTS / 100,
      `Valor mínimo por jogador é R$${PAYMENT_CONFIG.MIN_PRICE_PER_PLAYER_CENTS / 100}`,
    )
    .optional(),
  paymentDeadlineMinutes: z.number().min(5).max(1440).optional().default(30),
});

export type CreateMatchFormData = z.infer<typeof createMatchSchema>;
