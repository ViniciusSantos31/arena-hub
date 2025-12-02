"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

export const getOrgIdByCode = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { code } = parsedInput;

    if (!code) {
      throw new Error("Código da organização não fornecido");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, code),
    });

    if (!org) {
      throw new Error("Organização não encontrada");
    }

    return org.id;
  });

export const getOrganizationByCode = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const { code } = parsedInput;

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    if (!code) {
      throw new Error("Código da organização não fornecido");
    }

    const org = await db.query.organization.findFirst({
      where: eq(organization.code, code),
    });

    const userId = session.user.id;

    if (!org) {
      throw new Error("Organização não encontrada");
    }

    const membership = await db.query.member.findFirst({
      where: and(eq(member.userId, userId), eq(member.organizationId, org.id)),
    });

    const participantsCount = await db.query.member.findMany({
      where: eq(member.organizationId, org.id),
    });

    return {
      ...org,
      isAlreadyMember: !!membership,
      participants: participantsCount.length,
    };
  });
