import z4 from "zod/v4";

export const basicInfoSchema = z4.object({
  id: z4.string(),
  name: z4.string().min(1, "O nome do grupo é obrigatório"),
  rules: z4.string().optional(),
  description: z4.string().optional(),
});

export type BasicInfoFormData = z4.infer<typeof basicInfoSchema>;
