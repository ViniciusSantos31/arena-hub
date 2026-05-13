import z4 from "zod/v4";

export const punishmentConfigSchema = z4.object({
  punishmentsToSuspend: z4.number().min(1).max(50),
  suspensionMatchCount: z4.number().min(1).max(100),
});

export type PunishmentConfigFormData = z4.infer<typeof punishmentConfigSchema>;
