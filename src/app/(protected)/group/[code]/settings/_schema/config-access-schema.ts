import z4 from "zod/v4";

export const configAccessSchema = (
  minPlayersLimit: number,
  maxPlayersLimit?: number | null,
) =>
  z4.object({
    maxPlayers: z4
      .number()
      .min(minPlayersLimit)
      .refine(
        (value) => {
          if (!maxPlayersLimit) {
            return value >= minPlayersLimit;
          }

          return value >= 1 && value <= maxPlayersLimit;
        },
        {
          message: `O número de jogadores deve ser entre ${minPlayersLimit} e ${maxPlayersLimit ?? "ilimitado"}.`,
        },
      ),
  });

export type ConfigAccessFormData = z4.infer<
  ReturnType<typeof configAccessSchema>
>;
