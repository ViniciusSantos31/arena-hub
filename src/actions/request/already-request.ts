"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const alreadyRequest = actionClient
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

    if (!session?.user || !session.session) {
      return false;
    }

    const orgId = await getOrgIdByCode({
      code: organizationCode,
    }).then((res) => res.data);

    if (!orgId) {
      return false;
    }

    const request = await db.query.requestsTable.findFirst({
      where: (req, { eq, and }) =>
        and(
          eq(req.organizationId, orgId),
          eq(req.userId, session.user.id),
          eq(req.status, "pending"),
        ),
    });

    return !!request;
  });
