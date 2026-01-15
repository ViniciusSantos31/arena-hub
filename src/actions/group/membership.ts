"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod";
import { getOrgIdByCode } from "./get-org-by-code";

export const getUserMembership = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { organizationCode } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const orgId = await getOrgIdByCode({
      code: organizationCode,
    }).then((res) => res.data);

    if (!orgId) {
      throw new Error("Organização não encontrada");
    }

    const membership = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, orgId),
        ),
    });

    return membership;
  });
