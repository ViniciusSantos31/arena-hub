"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { requestsTable } from "@/db/schema/request";
import { can } from "@/hooks/use-guard";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod/v4";

export const listJoinRequests = actionClient
  .inputSchema(
    z.object({
      organizationCode: z.string().min(1),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { organizationCode } = parsedInput;

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, organizationCode),
      columns: { id: true },
    });

    if (!org) throw new Error("Grupo não encontrado");

    const myMembership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, org.id),
        eq(member.userId, session.user.id),
      ),
    });

    if (!myMembership || !can(myMembership, ["membership:approve"])) {
      throw new Error("Sem permissão para visualizar solicitações");
    }

    const requests = await db.query.requestsTable.findMany({
      where: and(
        eq(requestsTable.organizationId, org.id),
        eq(requestsTable.status, "pending"),
      ),
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
      orderBy: (r, { asc }) => [asc(r.createdAt)],
    });

    return requests.map((req) => ({
      id: req.id,
      message: req.message,
      createdAt: req.createdAt,
      user: req.user,
    }));
  });
