"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export const listMyGroups = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const { id } = session.user;

  const orgs = await db.query.member.findMany({
    where: eq(member.userId, id),
    columns: {
      organizationId: true,
    },
  });

  const organizationIds = orgs.map((org) => org.organizationId);

  const organizations = await Promise.all(
    organizationIds.map((orgId) => {
      return (
        db.query.organization.findFirst({
          where: eq(organization.id, orgId),
        }) ?? undefined
      );
    }),
  );

  return organizations.map((org) => org ?? undefined);
});
