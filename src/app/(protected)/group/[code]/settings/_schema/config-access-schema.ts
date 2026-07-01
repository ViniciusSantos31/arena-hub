import z4 from "zod/v4";

export const configAccessSchema = (maxPlayersLimit: number) =>
  z4.object({
    maxPlayers: z4.number().min(1).max(maxPlayersLimit),
  });

export type ConfigAccessFormData = z4.infer<
  ReturnType<typeof configAccessSchema>
>;
