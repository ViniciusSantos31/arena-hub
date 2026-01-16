"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod";
import { getOrgIdByCode } from "./get-org-by-code";

export const getUserMembership = actionClient
  .inputSchema(
    z
      .object({
        organizationCode: z.string(),
      })
      .or(
        z.object({
          organizationId: z.string(),
        }),
      ),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const organizationCode =
      "organizationCode" in parsedInput
        ? parsedInput.organizationCode
        : undefined;

    const organizationId =
      "organizationId" in parsedInput ? parsedInput.organizationId : undefined;

    if (!organizationCode && !organizationId) {
      throw new Error("Organization identifier is required");
    }

    let orgId: string | undefined;
    orgId = organizationId;

    if (!orgId) {
      orgId = await getOrgIdByCode({
        code: organizationCode!,
      }).then((res) => res.data);
    }

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
