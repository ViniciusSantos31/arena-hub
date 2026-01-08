import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";
import z from "zod";

export const getUserMembershipStatus = actionClient
  .inputSchema(
    z.object({
      organizationId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { organizationId } = parsedInput;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return false;
    }

    const membership = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.userId, session.user.id),
          eq(member.organizationId, organizationId),
        ),
    });

    return Boolean(membership);
  });
