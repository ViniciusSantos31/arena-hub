import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { member } from "@/db/schema/member";
import { roleHasActions } from "@/lib/group-permissions";
import type { Role } from "@/utils/role";
import { and, eq } from "drizzle-orm";

/** Admin/owner do grupo: pode iniciar Connect e ver status. */
export async function getOrgIfUserCanManageStripe(
  userId: string,
  organizationId: string,
) {
  const membership = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId),
    ),
  });

  if (
    !membership?.role ||
    !roleHasActions(membership.role as Role, ["group:settings"])
  ) {
    return null;
  }

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    columns: { id: true, stripeAccountId: true },
  });

  return org ?? null;
}
