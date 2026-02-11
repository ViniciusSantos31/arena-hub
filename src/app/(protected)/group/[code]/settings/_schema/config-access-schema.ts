import z4 from "zod/v4";

export const configAccessSchema = z4.object({
  isPrivate: z4.boolean(),
  maxPlayers: z4.number().min(1).max(100),
});

export type ConfigAccessFormData = z4.infer<typeof configAccessSchema>;
