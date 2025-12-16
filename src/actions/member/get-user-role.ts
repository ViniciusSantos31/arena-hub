import { db } from "@/db";
import { member } from "@/db/schema/member";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";

export const getUserMemberRole = cache(
  actionClient.action(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.session || !session.user.id) {
      throw new Error("Usuário não autenticado");
    }

    if (!session.session.activeOrganizationId) {
      return "guest";
    }

    const userMemeberRole = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, session.session.activeOrganizationId),
      ),
      columns: {
        role: true,
      },
    });

    return userMemeberRole?.role || "guest";
  }),
);
