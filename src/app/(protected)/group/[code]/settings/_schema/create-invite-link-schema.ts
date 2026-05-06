import z from "zod/v4";

export const createInviteLinkSchema = z.object({
  label: z
    .string()
    .min(3, "O identificador deve ter no mínimo 3 caracteres")
    .max(15, "O identificador deve ter no máximo 15 caracteres"),
  defaultRole: z.enum(["member", "guest"]),
  expiresAt: z.date().optional(),
  maxUses: z.number().min(1).max(1000).optional(),
});

export type CreateInviteLinkSchema = z.infer<typeof createInviteLinkSchema>;
