import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export const getGroupDetails = actionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { id } = parsedInput;

    if (!session) {
      throw new Error("Usuário não autenticado");
    }

    const group = await db.query.organization.findFirst({
      where: eq(organization.id, id),
    });

    if (!group) {
      throw new Error("Grupo não encontrado");
    }

    return group;
  });
