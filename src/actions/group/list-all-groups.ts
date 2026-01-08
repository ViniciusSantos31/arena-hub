"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { headers } from "next/headers";

const transformGroupMetadata = (metadata: string | null) => {
  if (!metadata) return null;

  try {
    const parsed: { description?: string } = JSON.parse(metadata);
    return parsed.description || null;
  } catch {
    return null;
  }
};

export const listAllGroups = actionClient.action(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const response = await db.query.organization.findMany({
    with: {
      members: {
        where: (members, { eq }) => eq(members.userId, session.user.id),
      },
    },
  });

  return response.map((group) => ({
    id: group.id,
    name: group.name,
    logo: group.logo,
    code: group.code,
    isPrivate: group.private,
    isMember: group.members.length > 0,
    description: transformGroupMetadata(group.metadata),
    createdAt: group.createdAt,
  }));
});
