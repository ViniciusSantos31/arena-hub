import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod";

const roleLevel: Record<string, number> = {
  admin: 3,
  member: 2,
  guest: 1,
};

const requiredLevel = 3;

export const updateMemberRole = actionClient
  .inputSchema(
    z.object({
      memberId: z.string(),
      role: z.enum(["admin", "member", "guest"]),
      organizationId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { memberId, role, organizationId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const userRoleLevel = roleLevel[role];
    if (userRoleLevel < requiredLevel) {
      throw new Error("Permissão insuficiente");
    }

    await auth.api.updateMemberRole({
      headers: await headers(),
      body: {
        memberId,
        role,
        organizationId,
      },
    });
  });
