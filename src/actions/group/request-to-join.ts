"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { requestsTable } from "@/db/schema/request";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod/v4";

export const requestToJoinGroup = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
      message: z.string().min(10, "Escreva pelo menos 10 caracteres").max(500),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode, message } = parsedInput;
    const userId = session.user.id;

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, organizationCode),
      columns: { id: true, private: true },
    });

    if (!org) throw new Error("Grupo não encontrado");

    if (!org.private) {
      throw new Error("Este grupo é público. Use a opção de entrar diretamente.");
    }

    const alreadyMember = await db.query.member.findFirst({
      where: and(eq(member.organizationId, org.id), eq(member.userId, userId)),
      columns: { id: true },
    });

    if (alreadyMember) throw new Error("Você já é membro deste grupo");

    const existingRequest = await db.query.requestsTable.findFirst({
      where: and(
        eq(requestsTable.organizationId, org.id),
        eq(requestsTable.userId, userId),
        eq(requestsTable.status, "pending"),
      ),
      columns: { id: true },
    });

    if (existingRequest) {
      throw new Error("Você já tem uma solicitação pendente para este grupo");
    }

    await db.insert(requestsTable).values({
      userId,
      organizationId: org.id,
      message,
      status: "pending",
    });

    revalidatePath("/groups");

    return { success: true };
  });
