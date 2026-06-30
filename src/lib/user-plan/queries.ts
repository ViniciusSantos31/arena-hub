import { db } from "@/db";
import { organization } from "@/db/schema/auth";
import { organizationInviteLink } from "@/db/schema/invite-link";
import { member } from "@/db/schema/member";
import { and, eq, isNull, sql } from "drizzle-orm";

export async function countOwnedGroups(userId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.role, "owner")))
    .then((rows) => rows[0]?.count ?? 0);

  return result;
}

export async function countActiveInviteLinksForOwner(
  userId: string,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(organizationInviteLink)
    .innerJoin(
      member,
      and(
        eq(member.organizationId, organizationInviteLink.organizationId),
        eq(member.userId, userId),
        eq(member.role, "owner"),
      ),
    )
    .where(isNull(organizationInviteLink.revokedAt))
    .then((rows) => rows[0]?.count ?? 0);

  return result;
}

export async function getOrganizationOwnerUserId(
  organizationId: string,
): Promise<string | null> {
  const owner = await db.query.member.findFirst({
    where: and(
      eq(member.organizationId, organizationId),
      eq(member.role, "owner"),
    ),
    columns: { userId: true },
  });

  return owner?.userId ?? null;
}

export async function getOrganizationMaxPlayers(
  organizationId: string,
): Promise<number> {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    columns: { maxPlayers: true },
  });

  return org?.maxPlayers ?? 10;
}
