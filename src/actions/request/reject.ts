"use server";

import { db } from "@/db";
import { requestsTable } from "@/db/schema/request";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import z from "zod/v4";

export const rejectJoinRequest = actionClient
  .inputSchema(
    z.object({
      requestId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { requestId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || !session.session) {
      throw new Error("Usuário não autenticado");
    }

    const joinRequest = await db.query.requestsTable.findFirst({
      where: (req, { eq }) => eq(req.id, requestId),
    });

    if (!joinRequest) {
      throw new Error("Solicitação de ingresso não encontrada");
    }

    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.id, joinRequest.organizationId),
    });

    if (!organization) {
      throw new Error("Organização não encontrada");
    }

    await db
      .update(requestsTable)
      .set({
        status: "rejected",
        reviewedBy: session.user.id,
      })
      .where(eq(requestsTable.id, requestId));

    revalidatePath("/group/" + organization.code + "/members/active", "layout");
  });
