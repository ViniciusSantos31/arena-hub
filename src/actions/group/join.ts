"use server";

import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { getOrganizationByCode } from "./get-org-by-code";

export const joinGroupByCode = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { user } = session;
    const { code } = parsedInput;

    const org = await getOrganizationByCode({
      code,
    });

    if (!org.data) {
      throw new Error("Organização não encontrada");
    }

    await auth.api.addMember({
      headers: await headers(),
      body: {
        role: "guest",
        organizationId: org.data.id,
        userId: user.id,
        score: 25,
      },
    });

    redirect("/group/" + code + "/members");
  });

export const joinGroup = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { user } = session;
    const { code } = parsedInput;

    const org = await getOrganizationByCode({
      code,
    });

    if (!org.data) {
      throw new Error("Organização não encontrada");
    }

    await auth.api.addMember({
      headers: await headers(),
      body: {
        role: "guest",
        organizationId: org.data?.id,
        userId: user.id,
        score: 25,
      },
    });

    revalidatePath("/");
  });

export const requestToJoinGroup = actionClient
  .inputSchema(
    z.object({
      code: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const { user } = session;
    const { code } = parsedInput;

    const org = await getOrganizationByCode({
      code,
    });

    if (!org.data) {
      throw new Error("Organização não encontrada");
    }

    // Logic to request to join the group can be implemented here

    redirect("/group/" + code + "/members");
  });
