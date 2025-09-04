import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const listMembers = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode } = parsedInput;

    if (!organizationCode) {
      throw new Error("Organização não encontrada");
    }

    const organization = await getOrgIdByCode({
      code: organizationCode,
    });

    if (!organization?.data) {
      throw new Error("Organização não encontrada");
    }

    const members = await db.query.member.findMany({
      where: eq(member.organizationId, organization.data),
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      columns: {
        id: true,
        score: true,
        role: true,
        userId: true,
      },
    });

    return members.map((member) => ({
      id: member.user.id,
      name: member.user.name,
      score: member.score,
      role: member.role,
    }));
  });
