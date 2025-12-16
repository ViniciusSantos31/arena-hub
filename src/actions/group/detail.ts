"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export const getGroupDetails = actionClient
  .inputSchema(z.object({ code: z.string() }))
  .action(async ({ parsedInput }) => {
    const activeSession = await auth.api.getSession({
      headers: await headers(),
    });

    const { code } = parsedInput;

    if (!activeSession) {
      throw new Error("Usuário não autenticado");
    }

    const group = await db.query.organization.findFirst({
      where: eq(organization.code, code),
    });

    if (!group) {
      throw new Error("Grupo não encontrado");
    }

    return group;
  });
