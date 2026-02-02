"use server";

import { db } from "@/db";
import { actionClient } from "@/lib/next-safe-action";
import z from "zod/v4";
import { getOrgIdByCode } from "../group/get-org-by-code";

export const listAllRequests = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { organizationCode } = parsedInput;

    const organizationId = await getOrgIdByCode({
      code: organizationCode,
    }).then((res) => res.data);

    if (!organizationId) {
      throw new Error("Organização não encontrada");
    }

    const requests = await db.query.requestsTable.findMany({
      where: (req, { eq, and }) =>
        and(eq(req.organizationId, organizationId), eq(req.status, "pending")),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      columns: {
        id: true,
        userId: true,
        status: true,
      },
    });

    return requests;
  });
