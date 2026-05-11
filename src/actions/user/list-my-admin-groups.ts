"use server";

import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";

export const listMyAdminGroups = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const memberships = await db.query.member.findMany({
    where: and(
      eq(member.userId, session.user.id),
      inArray(member.role, ["owner", "admin"]),
    ),
    columns: { organizationId: true, role: true },
  });

  if (memberships.length === 0) return [];

  const orgIds = memberships.map((m) => m.organizationId);

  const groups = await db.query.organization.findMany({
    where: inArray(organization.id, orgIds),
    columns: { id: true, name: true, code: true, logo: true },
  });

  const roleMap = new Map(memberships.map((m) => [m.organizationId, m.role]));

  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    code: g.code,
    logo: g.logo,
    role: roleMap.get(g.id) ?? "admin",
  }));
});
